import { PluginSettings, AltNode } from "types";
import { addWarning } from "../common/commonConversionWarnings";
import { calculateRectangleFromBoundingBox } from "../common/commonPosition";
import { isLikelyIcon } from "./iconDetection";
import { variableToColorName } from "../tailwind/conversionTables";

// Keep track of node names for sequential numbering
const nodeNameCounters: Map<string, number> = new Map();

export let getStyledTextSegmentsTime = 0;
export let processColorVariablesTime = 0;

// Simple variable cache for pure functions
const variableCache = new Map<string, string>();

/**
 * Maps variable IDs to color names and caches the result (pure version)
 */
const memoizedVariableToColorName = async (
  variableId: string,
): Promise<string> => {
  if (!variableCache.has(variableId)) {
    const colorName = (await variableToColorName(variableId)).replace(/,/g, "");
    variableCache.set(variableId, colorName);
    return colorName;
  }
  return variableCache.get(variableId)!;
};

/**
 * Collects all color variables used in a node and its descendants (pure version)
 */
const collectNodeColorVariables = async (
  node: any,
): Promise<Map<string, { variableId: string; variableName: string }>> => {
  const colorMappings = new Map<
    string,
    { variableId: string; variableName: string }
  >();

  // Helper function to add a mapping from a paint object
  const addMappingFromPaint = (paint: any) => {
    // Ensure we have a solid paint, a resolved variable name, and color data
    if (
      paint.type === "SOLID" &&
      paint.variableColorName &&
      paint.color &&
      paint.boundVariables?.color
    ) {
      // Prefer the actual variable name from the bound variable if available
      const variableName =
        paint.boundVariables.color.name || paint.variableColorName;

      if (variableName) {
        // Sanitize the variable name for CSS
        const sanitizedVarName = variableName.replace(/[^a-zA-Z0-9_-]/g, "-");

        const colorInfo = {
          variableId: paint.boundVariables.color.id,
          variableName: sanitizedVarName,
        };

        // Create hex representation of the color
        const r = Math.round(paint.color.r * 255);
        const g = Math.round(paint.color.g * 255);
        const b = Math.round(paint.color.b * 255);

        // Standard hex format (lowercase for consistent mapping)
        const hexColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toLowerCase();
        colorMappings.set(hexColor, colorInfo);

        // Add common named colors
        if (r === 255 && g === 255 && b === 255) {
          colorMappings.set("white", colorInfo);
          colorMappings.set("rgb(255,255,255)", colorInfo);
        } else if (r === 0 && g === 0 && b === 0) {
          colorMappings.set("black", colorInfo);
          colorMappings.set("rgb(0,0,0)", colorInfo);
        }
      }
    }
  };

  // Process fills
  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach(addMappingFromPaint);
  }

  // Process strokes
  if (node.strokes && Array.isArray(node.strokes)) {
    node.strokes.forEach(addMappingFromPaint);
  }

  // Process children recursively
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const childMappings = await collectNodeColorVariables(child);
      // Merge child mappings
      childMappings.forEach((value, key) => {
        colorMappings.set(key, value);
      });
    }
  }

  return colorMappings;
};

/**
 * Pure version of processNodePair that works with JSON data only
 * Enriches AltNode with additional processing without Figma API calls
 */
export const processNodePure = async (
  jsonNode: AltNode<any>,
  settings: PluginSettings,
  parentNode?: AltNode<any>,
  parentCumulativeRotation: number = 0,
): Promise<AltNode<any> | null> => {
  if (!jsonNode.id) return null;
  if (jsonNode.visible === false) return null;

  const nodeType = jsonNode.type;

  // Store the cumulative rotation
  if (parentNode) {
    jsonNode.cumulativeRotation = parentCumulativeRotation;
  }

  // Handle empty frames and convert to rectangles
  if (
    (nodeType === "FRAME" ||
      nodeType === "INSTANCE" ||
      nodeType === "COMPONENT" ||
      nodeType === "COMPONENT_SET") &&
    (!jsonNode.children || jsonNode.children.length === 0)
  ) {
    jsonNode.type = "RECTANGLE";
    return processNodePure(
      jsonNode,
      settings,
      parentNode,
      parentCumulativeRotation,
    );
  }

  if ("rotation" in jsonNode && jsonNode.rotation) {
    jsonNode.rotation = -jsonNode.rotation * (180 / Math.PI);
  }

  // Return null for unsupported nodes
  if (nodeType === "SLICE") {
    return null;
  }

  // Set parent reference if parent is provided
  if (parentNode) {
    (jsonNode as any).parent = parentNode;
  }

  // Ensure node has a unique name with simple numbering
  const cleanName = jsonNode.name.trim();

  // Track names with simple counter
  const count = nodeNameCounters.get(cleanName) || 0;
  nodeNameCounters.set(cleanName, count + 1);

  // For first occurrence, use original name; for duplicates, add sequential suffix
  jsonNode.uniqueName =
    count === 0
      ? cleanName
      : `${cleanName}_${count.toString().padStart(2, "0")}`;

  // Handle text-specific properties - pure version expects styledTextSegments to already be set
  if (jsonNode.type === "TEXT") {
    // In pure version, we assume styledTextSegments are already processed and added to jsonNode
    // If they're not present, we can't add them without Figma API access

    // Inline text style.
    Object.assign(jsonNode, jsonNode.style);
    if (!jsonNode.textAutoResize) {
      jsonNode.textAutoResize = "NONE";
    }
  }

  // Always copy size and position
  if ("absoluteBoundingBox" in jsonNode && jsonNode.absoluteBoundingBox) {
    if (jsonNode.parent) {
      // Extract width and height from bounding box and rotation
      const rect = calculateRectangleFromBoundingBox(
        {
          width: jsonNode.absoluteBoundingBox.width,
          height: jsonNode.absoluteBoundingBox.height,
          x:
            jsonNode.absoluteBoundingBox.x -
            (jsonNode.parent?.absoluteBoundingBox.x || 0),
          y:
            jsonNode.absoluteBoundingBox.y -
            (jsonNode.parent?.absoluteBoundingBox.y || 0),
        },
        -((jsonNode.rotation || 0) + (jsonNode.cumulativeRotation || 0)),
      );

      jsonNode.width = rect.width;
      jsonNode.height = rect.height;
      jsonNode.x = rect.left;
      jsonNode.y = rect.top;
    } else {
      jsonNode.width = jsonNode.absoluteBoundingBox.width;
      jsonNode.height = jsonNode.absoluteBoundingBox.height;
      jsonNode.x = 0;
      jsonNode.y = 0;
    }
  }

  // Add canBeFlattened property
  if (settings.embedVectors && !parentNode?.canBeFlattened) {
    const isIcon = isLikelyIcon(jsonNode as any);
    (jsonNode as any).canBeFlattened = isIcon;

    // If this node will be flattened to SVG, collect its color variables
    if (isIcon && settings.useColorVariables) {
      // Schedule color mapping collection after variable processing
      (jsonNode as any)._collectColorMappings = true;
    }
  } else {
    (jsonNode as any).canBeFlattened = false;
  }

  if (
    "individualStrokeWeights" in jsonNode &&
    jsonNode.individualStrokeWeights
  ) {
    (jsonNode as any).strokeTopWeight = jsonNode.individualStrokeWeights.top;
    (jsonNode as any).strokeBottomWeight =
      jsonNode.individualStrokeWeights.bottom;
    (jsonNode as any).strokeLeftWeight = jsonNode.individualStrokeWeights.left;
    (jsonNode as any).strokeRightWeight =
      jsonNode.individualStrokeWeights.right;
  }

  // Process color variables
  await processNodeColorVariables(jsonNode, settings);

  // Some places check if paddingLeft exists. This makes sure they all exist, even if 0.
  if ("layoutMode" in jsonNode && jsonNode.layoutMode) {
    if (jsonNode.paddingLeft === undefined) {
      jsonNode.paddingLeft = 0;
    }
    if (jsonNode.paddingRight === undefined) {
      jsonNode.paddingRight = 0;
    }
    if (jsonNode.paddingTop === undefined) {
      jsonNode.paddingTop = 0;
    }
    if (jsonNode.paddingBottom === undefined) {
      jsonNode.paddingBottom = 0;
    }
  }

  // Set default layout properties if missing
  if (!jsonNode.layoutMode) jsonNode.layoutMode = "NONE";
  if (!jsonNode.layoutGrow) jsonNode.layoutGrow = 0;
  if (!jsonNode.layoutSizingHorizontal)
    jsonNode.layoutSizingHorizontal = "FIXED";
  if (!jsonNode.layoutSizingVertical) jsonNode.layoutSizingVertical = "FIXED";
  if (!jsonNode.primaryAxisAlignItems) {
    jsonNode.primaryAxisAlignItems = "MIN";
  }
  if (!jsonNode.counterAxisAlignItems) {
    jsonNode.counterAxisAlignItems = "MIN";
  }

  // If layout sizing is HUG but there are no children, set it to FIXED
  const hasChildren =
    "children" in jsonNode &&
    jsonNode.children &&
    Array.isArray(jsonNode.children) &&
    jsonNode.children.length > 0;

  if (jsonNode.layoutSizingHorizontal === "HUG" && !hasChildren) {
    jsonNode.layoutSizingHorizontal = "FIXED";
  }
  if (jsonNode.layoutSizingVertical === "HUG" && !hasChildren) {
    jsonNode.layoutSizingVertical = "FIXED";
  }

  // Process children recursively if both have children
  if (
    "children" in jsonNode &&
    jsonNode.children &&
    Array.isArray(jsonNode.children)
  ) {
    // Get only visible JSON children
    const visibleJsonChildren = jsonNode.children.filter(
      (child) => child.visible !== false,
    ) as AltNode[];

    const cumulative =
      parentCumulativeRotation +
      (jsonNode.type === "GROUP" ? jsonNode.rotation || 0 : 0);

    // Process children and handle potential null returns
    const processedChildren = [];

    // Process all visible JSON children that have matching processed children
    for (const child of visibleJsonChildren) {
      const processedChild = await processNodePure(
        child,
        settings,
        jsonNode,
        cumulative,
      );

      if (processedChild !== null) {
        processedChildren.push(processedChild);
      }
    }

    // Replace children array with processed children
    jsonNode.children = processedChildren;

    if (
      jsonNode.layoutMode === "NONE" ||
      jsonNode.children.some(
        (d: any) =>
          "layoutPositioning" in d && d.layoutPositioning === "ABSOLUTE",
      )
    ) {
      jsonNode.isRelative = true;
    }

    adjustChildrenOrder(jsonNode);
  }

  // Collect color variables for SVG nodes after all processing is done
  if ((jsonNode as any)._collectColorMappings) {
    (jsonNode as any).colorVariableMappings =
      await collectNodeColorVariables(jsonNode);
    delete (jsonNode as any)._collectColorMappings;
  }

  return jsonNode;
};

/**
 * Process color variables for a pure node (no Figma API access)
 */
const processNodeColorVariables = async (
  node: AltNode,
  settings: PluginSettings,
) => {
  const start = Date.now();

  if (settings.useColorVariables) {
    if (node.fills && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        await processPaintColorVariables(fill);
      }
    }
    if (node.strokes && Array.isArray(node.strokes)) {
      for (const stroke of node.strokes) {
        await processPaintColorVariables(stroke);
      }
    }
    if ("effects" in node && node.effects && Array.isArray(node.effects)) {
      for (const effect of node.effects) {
        if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
          await processEffectColorVariables(effect);
        }
      }
    }
  }

  processColorVariablesTime += Date.now() - start;
};

/**
 * Process color variables in a paint style and add pre-computed variable names
 */
export const processPaintColorVariables = async (paint: any) => {
  // This is a simplified version since we can't access Figma API
  // Assumes variableColorName is already set if it exists
  if (
    paint.type === "GRADIENT_ANGULAR" ||
    paint.type === "GRADIENT_DIAMOND" ||
    paint.type === "GRADIENT_LINEAR" ||
    paint.type === "GRADIENT_RADIAL"
  ) {
    // For gradients, assume gradient stops' variableColorName are already set
  } else if (paint.type === "SOLID" && paint.boundVariables?.color && !paint.variableColorName) {
    // Try to compute variable name if not already set
    try {
      (paint as any).variableColorName = await memoizedVariableToColorName(
        paint.boundVariables.color.id,
      );
    } catch (error) {
      // If we can't get variable name, skip
      console.warn("Could not get variable name for paint:", error);
    }
  }
};

/**
 * Process color variables for effects
 */
const processEffectColorVariables = async (effect: any) => {
  if (effect.boundVariables?.color && !effect.variableColorName) {
    try {
      (effect as any).variableColorName = await memoizedVariableToColorName(
        effect.boundVariables.color.id,
      );
    } catch (error) {
      console.warn("Could not get variable name for effect:", error);
    }
  }
};

function adjustChildrenOrder(node: any) {
  if (!node.itemReverseZIndex || !node.children || node.layoutMode === "NONE") {
    return;
  }

  const children = node.children;
  const absoluteChildren = [];
  const fixedChildren = [];

  // Single pass to separate absolute and fixed children
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (child.layoutPositioning === "ABSOLUTE") {
      absoluteChildren.push(child);
    } else {
      fixedChildren.unshift(child); // Add to beginning to maintain original order
    }
  }

  // Combine the arrays (reversed absolute children + original order fixed children)
  node.children = [...absoluteChildren, ...fixedChildren];
}

/**
 * Reset performance counters
 */
export const resetPerformanceCounters = () => {
  getStyledTextSegmentsTime = 0;
  processColorVariablesTime = 0;
};

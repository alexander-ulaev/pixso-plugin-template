// import { indentString } from "../common/indentString";
// import { HtmlTextBuilder } from "../html/htmlTextBuilder";
// import { HtmlDefaultBuilder } from "../html/htmlDefaultBuilder";
// import { htmlAutoLayoutProps } from "../html/builderImpl/htmlAutoLayout";
// import { formatWithJSX } from "../common/parseJSX";
// import {
//   PluginSettings,
//   HTMLSettings,
//   AltNode,
//   ExportableNode,
// } from "./types";
// import {
//   exportNodeAsBase64PNG,
//   getPlaceholderImage,
//   nodeHasImageFill,
// } from "../common/images";
// import { addWarning } from "../common/commonConversionWarnings";
// import {
//   HtmlOutput,
//   resetClassNameCounters,
// } from "../html/htmlMain";

// const selfClosingTags = ["img"];

// let previousExecutionCache: { style: string; text: string }[];

// // Local variables to avoid dependency on htmlMain global state
// let isPreviewGlobal = false;

// interface CSSCollection {
//   [className: string]: {
//     styles: string[];
//     nodeName?: string;
//     nodeType?: string;
//     element?: string;
//   };
// }

// let cssCollection: CSSCollection = {};

// type HtmlGenerationMode = "html" | "jsx" | "styled-components" | "svelte";

// // Define HTML generation modes for better type safety
// const generateComponentCode = (
//   html: string,
//   jsonNodes: Array<AltNode<any>>,
//   mode: HtmlGenerationMode,
// ): string => {
//   switch (mode) {
//     case "styled-components":
//       return generateReactComponent(html, jsonNodes);
//     case "svelte":
//       return generateSvelteComponent(html);
//     case "html":
//     case "jsx":
//     default:
//       return html;
//   }
// };

// // Generate React component from HTML, with optional styled-components
// const generateReactComponent = (
//   html: string,
//   jsonNodes: Array<AltNode<any>>,
// ): string => {
//   const styledComponentsCode = generateStyledComponents();

//   const componentName = getReactComponentName(jsonNodes[0]);

//   const imports = [
//     'import React from "react";',
//     'import styled from "styled-components";',
//   ];

//   return `${imports.join("\n")}
// ${styledComponentsCode ? `\n${styledComponentsCode}` : ""}

// export const ${componentName} = () => {
//   return (
// ${indentString(html, 4)}
//   );
// };`;
// }

// // Generate Svelte component from the collected styles and HTML
// const generateSvelteComponent = (html: string): string => {
//   // Build CSS classes similar to styled-components but for Svelte
//   const cssRules: string[] = [];

//   Object.entries(cssCollection).forEach(([className, { styles }]) => {
//     if (!styles.length) return;

//     // Always use class selector to avoid conflicts
//     cssRules.push(
//       `.${className} {\n  ${styles.join(";\n  ")}${styles.length ? ";" : ""}\n}`,
//     );
//   });

//   return `${html}

// <style>
// ${cssRules.join("\n\n")}
// </style>`;
// };

// // Generate styled-components with improved naming and formatting
// const generateStyledComponents = (): string => {
//   const components: string[] = [];

//   Object.entries(cssCollection).forEach(
//     ([className, { styles, nodeName, nodeType, element }]) => {
//       // Skip if no styles
//       if (!styles.length) return;

//       // Determine base HTML element - defaults to div
//       const baseElement = element || (nodeType === "TEXT" ? "p" : "div");
//       const componentName = getComponentName(
//         { name: nodeName },
//         className,
//         baseElement,
//       );

//       const styledComponent = `const ${componentName} = styled.${baseElement}\`
//   ${styles.join(";\n  ")}${styles.length ? ";" : ""}
// \`;`;

//       components.push(styledComponent);
//     },
//   );

//   if (components.length === 0) {
//     return "";
//   }

//   return `${components.join("\n\n")}`;
// };

// // Get proper component name from node info
// const getComponentName = (
//   node: any,
//   className?: string,
//   nodeType = "div",
// ): string => {
//   // Start with Styled prefix
//   let name = "Styled";

//   // Use uniqueName if available, otherwise use name
//   const nodeName: string = node.uniqueName || node.name;

//   // Try to use node name first
//   if (nodeName && nodeName.length > 0) {
//     // Clean up the node name and capitalize first letter
//     const cleanName = nodeName
//       .replace(/[^a-zA-Z0-9]/g, "")
//       .replace(/^[a-z]/, (match) => match.toUpperCase());

//     name += cleanName || nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
//   }
//   // Fall back to className if provided
//   else if (className) {
//     const parts = className.split("-");
//     if (parts.length > 0 && parts[0]) {
//       name += parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
//     } else {
//       name += nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
//     }
//   }
//   // Last resort
//   else {
//     name += nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
//   }

//   return name;
// };

// // Get a valid React component name from a layer name
// const getReactComponentName = (node: any): string => {
//   // Use uniqueName if available, otherwise use name
//   const name: string = node?.uniqueName || node?.name;

//   // Default name if nothing valid is provided
//   if (!name || name.trim() === "") {
//     return "App";
//   }

//   // Convert to PascalCase
//   let componentName = name
//     .replace(/[^a-zA-Z0-9_]/g, " ") // Replace non-alphanumeric chars with spaces
//     .split(/\s+/) // Split by spaces
//     .map((part) =>
//       part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : "",
//     )
//     .join("");

//   // Ensure it starts with uppercase letter (React component convention)
//   componentName =
//     componentName.charAt(0).toUpperCase() + componentName.slice(1);

//   // Ensure it's a valid identifier - if it starts with a number, prefix with 'Component'
//   if (/^[0-9]/.test(componentName)) {
//     componentName = "Component" + componentName;
//   }

//   // If we ended up with nothing valid, use the default
//   return componentName || "App";
// };

// // Get the collected CSS as a string with improved formatting
// const getCollectedCSS = (): string => {
//   if (Object.keys(cssCollection).length === 0) {
//     return "";
//   }

//   return Object.entries(cssCollection)
//     .map(([className, { styles }]) => {
//       if (!styles.length) return "";
//       return `.${className} {\n  ${styles.join(";\n  ")}${styles.length ? ";" : ""}\n}`;
//     })
//     .filter(Boolean)
//     .join("\n\n");
// };

// /**
//  * Convert processed JSON nodes (after processNodePair) to HTML and CSS
//  * Pure function that doesn't depend on Figma API
//  * @param jsonNodes Array of processed AltNode objects (after processNodePair)
//  * @param settings Plugin settings
//  * @param isPreview Whether this is for preview mode
//  * @returns Object containing html and optional css
//  */
// export const jsonToHtml = async (
//   jsonNodes: Array<AltNode<any>>,
//   settings: PluginSettings,
//   isPreview: boolean = false,
// ): Promise<HtmlOutput> => {
//   isPreviewGlobal = isPreview;
//   previousExecutionCache = [];
//   cssCollection = {};
//   resetClassNameCounters(); // Reset counters for each new generation

//   let htmlContent = await jsonWidgetGenerator(jsonNodes, settings);

//   // remove the initial \n that is made in Container.
//   if (htmlContent.length > 0 && htmlContent.startsWith("\n")) {
//     htmlContent = htmlContent.slice(1, htmlContent.length);
//   }

//   // Always return an object with html property
//   const output: HtmlOutput = { html: htmlContent };

//   // Handle different HTML generation modes
//   const mode = settings.htmlGenerationMode || "html";

//   if (mode !== "html") {
//     // Generate component code for non-html modes
//     output.html = generateComponentCode(htmlContent, jsonNodes as any, mode);

//     // For svelte mode, we don't need separate CSS as it's included in the component
//     if (mode === "svelte" && Object.keys(cssCollection).length > 0) {
//       // CSS is already included in the Svelte component
//     }
//   } else if (Object.keys(cssCollection).length > 0) {
//     // For plain HTML with CSS, include CSS separately
//     output.css = getCollectedCSS();
//   }

//   return output;
// };

// /**
//  * Generate HTML preview from processed JSON nodes
//  */
// export const jsonToHtmlPreview = async (
//   jsonNodes: Array<AltNode<any>>,
//   settings: PluginSettings,
// ): Promise<{ size: { width: number; height: number }; content: string; css?: string }> => {
//   let result = await jsonToHtml(
//     jsonNodes,
//     {
//       ...settings,
//       htmlGenerationMode: "html",
//     },
//     jsonNodes.length > 1 ? false : true,
//   );

//   if (jsonNodes.length > 1) {
//     result.html = `<div style="width: 100%; height: 100%">${result.html}</div>`;
//   }

//   return {
//     size: {
//       width: Math.max(...jsonNodes.map((node) => node.width || 0)),
//       height: jsonNodes.map((node) => node.height || 0).reduce((sum, h) => sum + h, 0),
//     },
//     content: result.html,
//     css: result.css,
//   };
// };

// const jsonWidgetGenerator = async (
//   jsonNodes: ReadonlyArray<AltNode<any>>,
//   settings: HTMLSettings,
// ): Promise<string> => {
//   // filter non visible nodes. Visibility is already processed in JSON
//   const visibleNodes = jsonNodes.filter(node => node.visible !== false);

//   const promiseOfConvertedCode = visibleNodes.map(
//     convertNodeFromJson(settings),
//   );
//   const code = (await Promise.all(promiseOfConvertedCode)).join("");
//   return code;
// };

// const convertNodeFromJson = (settings: HTMLSettings) => async (node: AltNode<any>) => {
//   if (settings.embedVectors && node.canBeFlattened) {
//     // SVG is already attached during processNodePair
//     if (node.svg) {
//       return jsonWrapSVG(node, settings);
//     }
//   }

//   switch (node.type) {
//     case "RECTANGLE":
//     case "ELLIPSE":
//       return await jsonContainer(node, "", [], settings);
//     case "FRAME":
//     case "COMPONENT":
//     case "INSTANCE":
//     case "COMPONENT_SET":
//       return await jsonFrame(node, settings);
//     case "SECTION":
//       return await jsonSection(node, settings);
//     case "TEXT":
//       return jsonText(node, settings);
//     case "LINE":
//       return jsonLine(node, settings);
//     case "VECTOR":
//       if (!settings.embedVectors && !isPreviewGlobal) {
//         addWarning("Vector is not supported");
//       }
//       return await jsonContainer(
//         { ...node, type: "RECTANGLE" } as any,
//         "",
//         [],
//         settings,
//       );
//     default:
//       addWarning(`${node.type} node is not supported`);
//       return "";
//   }
// };

// const jsonWrapSVG = (
//   node: AltNode<any>,
//   settings: HTMLSettings,
// ): string => {
//   if (!node.svg || node.svg === "") return "";

//   const builder = new HtmlDefaultBuilder(node, settings)
//     .addData("svg-wrapper")
//     .position();

//   return `\n<div${builder.build()}>\n${indentString(node.svg)}</div>`;
// };

// const jsonGroup = async (
//   node: AltNode<any>,
//   settings: HTMLSettings,
// ): Promise<string> => {
//   // ignore the view when size is zero or less
//   if ((node.width || 0) < 0 || (node.height || 0) <= 0 || !node.children || node.children.length === 0) {
//     return "";
//   }

//   const builder = new HtmlDefaultBuilder(node, settings).commonPositionStyles();

//   if (builder.styles) {
//     const attr = builder.build();
//     const generator = await jsonWidgetGenerator(node.children, settings);
//     return `\n<div${attr}>${indentString(generator)}\n</div>`;
//   }
//   return await jsonWidgetGenerator(node.children, settings);
// };

// const jsonText = (node: AltNode<any>, settings: HTMLSettings): string => {
//   let layoutBuilder = new HtmlTextBuilder(node, settings)
//     .commonPositionStyles()
//     .textTrim()
//     .textAlignHorizontal()
//     .textAlignVertical();

//   const styledHtml = layoutBuilder.getTextSegments(node);
//   previousExecutionCache.push(...styledHtml);

//   const mode = settings.htmlGenerationMode || "html";

//   // For styled-components mode
//   if (mode === "styled-components") {
//     const componentName = layoutBuilder.cssClassName
//       ? getComponentName(node, layoutBuilder.cssClassName, "p")
//       : getComponentName(node, undefined, "p");

//     if (styledHtml.length === 1) {
//       return `\n<${componentName}>${styledHtml[0].text}</${componentName}>`;
//     } else {
//       const content = styledHtml
//         .map((style) => {
//           const tag =
//             style.openTypeFeatures?.SUBS === true
//               ? "sub"
//               : style.openTypeFeatures?.SUPS === true
//                 ? "sup"
//                 : "span";

//           if (style.componentName) {
//             return `<${style.componentName}>${style.text}</${style.componentName}>`;
//           }
//           return `<${tag}>${style.text}</${tag}>`;
//         })
//         .join("");

//       return `\n<${componentName}>${content}</${componentName}>`;
//     }
//   }

//   // Standard HTML/CSS approach for HTML, React or Svelte
//   let content = "";
//   if (styledHtml.length === 1) {
//     // For HTML and React modes, we use inline styles
//     if (mode === "html" || mode === "jsx") {
//       layoutBuilder.addStyles(styledHtml[0].style);
//     }

//     content = styledHtml[0].text;

//     const additionalTag =
//       styledHtml[0].openTypeFeatures?.SUBS === true
//         ? "sub"
//         : styledHtml[0].openTypeFeatures?.SUPS === true
//           ? "sup"
//           : "";

//     if (additionalTag) {
//       content = `<${additionalTag}>${content}</${additionalTag}>`;
//     } else if (mode === "svelte" && styledHtml[0].className) {
//       content = `<span class="${styledHtml[0].className}">${content}</span>`;
//     }
//   } else {
//     content = styledHtml
//       .map((style) => {
//         const tag =
//           style.openTypeFeatures?.SUBS === true
//             ? "sub"
//             : style.openTypeFeatures?.SUPS === true
//               ? "sup"
//               : "span";

//         if (mode === "svelte" && style.className) {
//           return `<span class="${style.className}">${style.text}</span>`;
//         }

//         return `<${tag} style="${style.style}">${style.text}</${tag}>`;
//       })
//       .join("");
//   }

//   return `\n<div${layoutBuilder.build()}>${content}</div>`;
// };

// const jsonFrame = async (
//   node: AltNode<any>,
//   settings: HTMLSettings,
// ): Promise<string> => {
//   if (!node.children) node.children = [];

//   const childrenStr = await jsonWidgetGenerator(node.children, settings);

//   if (node.layoutMode !== "NONE") {
//     const rowColumn = htmlAutoLayoutProps(node, settings);
//     return await jsonContainer(node, childrenStr, rowColumn, settings);
//   }

//   // node.layoutMode === "NONE" && node.children.length > 1
//   // children needs to be absolute
//   return await jsonContainer(node, childrenStr, [], settings);
// };

// const jsonContainer = async (
//   node: AltNode<any>,
//   children: string,
//   additionalStyles: string[] = [],
//   settings: HTMLSettings,
// ): Promise<string> => {
//   // ignore the view when size is zero or less
//   if ((node.width || 0) <= 0 || (node.height || 0) <= 0) {
//     return children;
//   }

//   const builder = new HtmlDefaultBuilder(node, settings)
//     .commonPositionStyles()
//     .commonShapeStyles();

//   if (builder.styles || additionalStyles) {
//     let tag = "div";
//     let src = "";

//     if (nodeHasImageFill(node)) {
//       const hasChildren = node.children && node.children.length > 0;
//       let imgUrl = "";

//       if (
//         settings.embedImages &&
//         (settings as PluginSettings).framework === "HTML"
//       ) {
//         imgUrl = (await exportNodeAsBase64PNG(node as AltNode<ExportableNode>, hasChildren)) ?? "";
//       } else {
//         imgUrl = getPlaceholderImage(node.width || 0, node.height || 0);
//       }

//       if (hasChildren) {
//         builder.addStyles(
//           formatWithJSX(
//             "background-image",
//             settings.htmlGenerationMode === "jsx",
//             `url(${imgUrl})`,
//           ),
//         );
//       } else {
//         tag = "img";
//         src = ` src="${imgUrl}"`;
//       }
//     }

//     const build = builder.build(additionalStyles);
//     const mode = settings.htmlGenerationMode || "html";

//     // For styled-components mode
//     if (mode === "styled-components" && builder.cssClassName) {
//       const componentName = getComponentName(node, builder.cssClassName);

//       if (children) {
//         return `\n<${componentName}>${indentString(children)}\n</${componentName}>`;
//       } else {
//         return `\n<${componentName} ${src}/>`;
//       }
//     }

//     // Standard HTML approach for HTML, React, or Svelte
//     if (children) {
//       return `\n<${tag}${build}${src}>${indentString(children)}\n</${tag}>`;
//     } else if (
//       selfClosingTags.includes(tag) ||
//       settings.htmlGenerationMode === "jsx"
//     ) {
//       return `\n<${tag}${build}${src} />`;
//     } else {
//       return `\n<${tag}${build}${src}></${tag}>`;
//     }
//   }

//   return children;
// };

// const jsonSection = async (
//   node: AltNode<any>,
//   settings: HTMLSettings,
// ): Promise<string> => {
//   if (!node.children) node.children = [];

//   const childrenStr = await jsonWidgetGenerator(node.children, settings);
//   const builder = new HtmlDefaultBuilder(node, settings)
//     .size()
//     .position()
//     .applyFillsToStyle(node.fills, "background");

//   if (childrenStr) {
//     return `\n<div${builder.build()}>${indentString(childrenStr)}\n</div>`;
//   } else {
//     return `\n<div${builder.build()}></div>`;
//   }
// };

// const jsonLine = (node: AltNode<any>, settings: HTMLSettings): string => {
//   const builder = new HtmlDefaultBuilder(node, settings)
//     .commonPositionStyles()
//     .commonShapeStyles();

//   return `\n<div${builder.build()}></div>`;
// };

// export const jsonCodeGenTextStyles = (settings: HTMLSettings) => {
//   const result = previousExecutionCache
//     .map(
//       (style) =>
//         `// ${style.text}\n${style.style.split(settings.htmlGenerationMode === "jsx" ? "," : ";").join(";\n")}`,
//     )
//     .join("\n---\n");

//   if (!result) {
//     return "// No text styles in this selection";
//   }
//   return result;
// };

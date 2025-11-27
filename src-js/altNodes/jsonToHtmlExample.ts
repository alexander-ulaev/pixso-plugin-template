// Example usage of jsonToHtml function
// This shows how to use the pure function that converts processed AltNode JSON to HTML/CSS

import { jsonToHtml } from './jsonToHtml';
import { PluginSettings } from 'types';
import { AltNode } from 'types';

// Example: Processed JSON node after processNodePair
const exampleProcessedNode: AltNode<any> = {
  id: "frame-1",
  type: "FRAME",
  name: "Main Container",
  uniqueName: "main_container",
  width: 400,
  height: 300,
  x: 0,
  y: 0,
  visible: true,
  layoutMode: "NONE",
  layoutSizingHorizontal: "FIXED",
  layoutSizingVertical: "FIXED",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  layoutGrow: 0,
  fills: [],
  strokes: [],
  strokeTopWeight: 0,
  strokeBottomWeight: 0,
  strokeLeftWeight: 0,
  strokeRightWeight: 0,
  individualStrokeWeights: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  effects: [],
  cornerRadius: 0,
  absoluteBoundingBox: {
    x: 0,
    y: 0,
    width: 400,
    height: 300
  },
  children: [
    {
      id: "text-1",
      type: "TEXT",
      name: "Hello World",
      uniqueName: "hello_world",
      width: 200,
      height: 50,
      x: 100,
      y: 125,
      visible: true,
      layoutMode: "NONE",
      layoutSizingHorizontal: "FIXED",
      layoutSizingVertical: "FIXED",
      primaryAxisAlignItems: "MIN",
      counterAxisAlignItems: "MIN",
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      layoutGrow: 0,
      fills: [
        {
          type: "SOLID",
          color: { r: 0, g: 0, b: 0 },
          opacity: 1
        }
      ],
      strokes: [],
      strokeTopWeight: 0,
      strokeBottomWeight: 0,
      strokeLeftWeight: 0,
      strokeRightWeight: 0,
      individualStrokeWeights: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      style: {
        fontFamily: "Arial",
        fontPostScriptName: "Arial",
        fontWeight: 400,
        fontSize: 24,
        textAlignHorizontal: "LEFT",
        textAlignVertical: "TOP",
        letterSpacing: 0,
        lineHeightPx: 28.8,
        lineHeightPercent: 120,
        lineHeightPercentFontSize: 120,
        lineHeightUnit: "PIXELS"
      },
      textAutoResize: "WIDTH_AND_HEIGHT",
      styledTextSegments: [
        {
          start: 0,
          end: 11,
          text: "Hello World",
          fontName: { family: "Arial", style: "Regular" },
          fontSize: 24,
          fontWeight: 400,
          hyperlink: null,
          fills: [
            {
              type: "SOLID",
              color: { r: 0, g: 0, b: 0 },
              opacity: 1
            }
          ],
          textDecoration: "NONE",
          textCase: "ORIGINAL",
          lineHeight: { value: 120, unit: "PERCENT" },
          letterSpacing: { value: 0, unit: "PIXELS" },
          listOptions: null,
          indentation: 0,
          openTypeFeatures: {}
        }
      ],
      effects: [],
      cornerRadius: 0,
      absoluteBoundingBox: {
        x: 100,
        y: 125,
        width: 200,
        height: 50
      }
    }
  ]
};

// Example PluginSettings
const exampleSettings: PluginSettings = {
  framework: "HTML",
  htmlGenerationMode: "html",
  tailwindGenerationMode: "html",
  showLayerNames: false,
  embedImages: false,
  embedVectors: true,
  useColorVariables: false,
  baseFontSize: 16,
  roundTailwindValues: true,
  roundTailwindColors: true,
  customTailwindPrefix: "",
  thresholdPercent: 0.01,
  baseFontFamily: "Arial",
  useTailwind4: false,
  responsiveRoot: false,
  flutterGenerationMode: "stateless",
  swiftUIGenerationMode: "struct",
  composeGenerationMode: "snippet",
  useOldPluginVersion2025: false
};

// Usage example
async function demonstrateJsonToHtml() {
  try {
    const result = await jsonToHtml([exampleProcessedNode], exampleSettings);

    console.log("Generated HTML:");
    console.log(result.html);

    if (result.css) {
      console.log("\nGenerated CSS:");
      console.log(result.css);
    }

    // Example with styled-components mode
    const styledResult = await jsonToHtml(
      [exampleProcessedNode],
      { ...exampleSettings, htmlGenerationMode: "styled-components" }
    );

    console.log("\nGenerated React Styled Components:");
    console.log(styledResult.html);

  } catch (error) {
    console.error("Error generating HTML:", error);
  }
}

// Export for external usage
export { demonstrateJsonToHtml, exampleProcessedNode, exampleSettings };

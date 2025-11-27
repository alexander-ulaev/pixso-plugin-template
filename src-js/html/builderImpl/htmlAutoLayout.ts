import { HTMLSettings } from "../../types";
import { formatMultipleJSXArray } from "../../common/parseJSX";

const getFlexDirection = (node: any): string =>
  node.layoutMode === "HORIZONTAL" ? "" : "column";

const getJustifyContent = (node: any): string | undefined => {
  switch (node.primaryAxisAlignItems) {
    case undefined:
    case "MIN":
      return "flex-start";
    case "CENTER":
      return "center";
    case "MAX":
      return "flex-end";
    case "SPACE_BETWEEN":
      return "space-between";
  }
};

const getAlignItems = (node: any): string | undefined => {
  switch (node.counterAxisAlignItems) {
    case undefined:
    case "MIN":
      return "flex-start";
    case "CENTER":
      return "center";
    case "MAX":
      return "flex-end";
    case "BASELINE":
      return "baseline";
  }
};

const getGap = (node: any): string | number =>
  node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN"
    ? node.itemSpacing
    : "";

const getFlexWrap = (node: any): string =>
  node.layoutWrap === "WRAP" ? "wrap" : "";

const getAlignContent = (node: any): string => {
  if (node.layoutWrap !== "WRAP") return "";

  switch (node.counterAxisAlignItems) {
    case undefined:
    case "MIN":
      return "flex-start";
    case "CENTER":
      return "center";
    case "MAX":
      return "flex-end";
    case "BASELINE":
      return "baseline";
    default:
      return "normal";
  }
};

const getFlex = (
  node: any,
  autoLayout: any,
): string =>
  node.parent &&
  "layoutMode" in node.parent &&
  node.parent.layoutMode === autoLayout.layoutMode
    ? "flex"
    : "inline-flex";

export const htmlAutoLayoutProps = (
  node: any,
  settings: HTMLSettings,
): string[] =>
  formatMultipleJSXArray(
    {
      "flex-direction": getFlexDirection(node),
      "justify-content": getJustifyContent(node),
      "align-items": getAlignItems(node),
      gap: getGap(node),
      display: getFlex(node, node),
      "flex-wrap": getFlexWrap(node),
      "align-content": getAlignContent(node),
    },
    settings.htmlGenerationMode === "jsx",
  );

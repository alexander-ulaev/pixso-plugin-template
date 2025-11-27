export const getVisibleNodes = (nodes: readonly any[]) =>
  nodes.filter((d) => d.visible ?? true);

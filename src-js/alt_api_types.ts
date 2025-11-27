import { type Node } from "./api_types";

export type AltNode = Node & {
  styledTextSegments: Array<
    Pick<any, any | "characters" | "start" | "end">
  >;
  cumulativeRotation: number;
  uniqueName: string;
  canBeFlattened: boolean;
  isRelative: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
};

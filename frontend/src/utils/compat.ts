import { scoreTier } from "./scoreTier";

const CLASS_BY_TIER = {
  good: "compatGood",
  mid: "compatMid",
  low: "compatLow",
} as const;

/** Nombre de clase CSS por nivel; los umbrales viven solo en scoreTier. */
export const compatClass = (pct: number) => CLASS_BY_TIER[scoreTier(pct)];

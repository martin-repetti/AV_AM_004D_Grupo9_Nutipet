export const compatClass = (pct: number) =>
  pct >= 90 ? "compatGood" : pct >= 80 ? "compatMid" : "compatLow";

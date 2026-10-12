const STAGE_RANGES: { maxYears: number; stage: string }[] = [
  { maxYears: 1, stage: "cachorro" },
  { maxYears: 7, stage: "adulto" },
  { maxYears: Infinity, stage: "senior" },
];

/** Deriva "cachorro" | "adulto" | "senior" desde la fecha de nacimiento. */
export function petStage(birthDate: string | null): string | null {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const years =
    (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  return STAGE_RANGES.find((range) => years < range.maxYears)?.stage ?? null;
}

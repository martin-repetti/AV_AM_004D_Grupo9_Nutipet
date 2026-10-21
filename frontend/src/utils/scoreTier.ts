/** Mismos cortes que los tokens --np-good / --np-mid / --np-low de globals.css. */
export function scoreTier(score: number): "good" | "mid" | "low" {
  if (score >= 90) return "good";
  if (score >= 80) return "mid";
  return "low";
}

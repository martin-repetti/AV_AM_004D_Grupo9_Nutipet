import { describe, expect, it } from "vitest";
import { validateWeightsSumToOne } from "../ruleSet";
import { DEFAULT_WEIGHTS } from "../defaultWeights";
import type { RuleSetWeights } from "../types";

describe("validateWeightsSumToOne", () => {
  it("acepta los pesos por defecto (suman 1)", () => {
    expect(() => validateWeightsSumToOne(DEFAULT_WEIGHTS)).not.toThrow();
  });

  it("rechaza pesos que no suman 1", () => {
    const broken: RuleSetWeights = { ...DEFAULT_WEIGHTS, edad: 0.5 };

    expect(() => validateWeightsSumToOne(broken)).toThrow(/deben sumar 1/);
  });
});

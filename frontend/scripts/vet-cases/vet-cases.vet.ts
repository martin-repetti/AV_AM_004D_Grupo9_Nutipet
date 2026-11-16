/**
 * Corre los casos de scripts/vet-cases/cases.ts contra el catálogo real
 * (la base local) con el mismo motor y los mismos filtros que /comparar,
 * y guarda el top 3 de cada caso en reports/casos-veterinario.json para
 * revisarlo con un veterinario.
 *
 *   npm run vet-cases
 *
 * Además verifica lo que nunca debe fallar (especie, alergias, preferencia).
 */
import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compareFoods } from "@/lib/compatibility/engine";
import { getActiveRuleSetWeights } from "@/lib/compatibility/ruleSet";
import { parseAllergyTokens } from "@/lib/compatibility/allergies";
import { petStage } from "@/lib/compatibility/petStage";
import { CRITERION_LABELS, type NutritionRange, type RuleSetWeights, type ScoredFood } from "@/lib/compatibility/types";
import { getAllFoods } from "@/services/foods";
import { getNutritionRanges } from "@/services/nutritionRanges";
import type { FoodRow } from "@/types/catalogFood";
import { VET_CASES, type VetCase } from "./cases";

const TOP_N = 3;
const OUTPUT = path.join(__dirname, "..", "..", "reports", "casos-veterinario.json");

function readEnvLocal() {
  const content = fs.readFileSync(path.join(__dirname, "..", "..", ".env.local"), "utf8");
  const get = (key: string) =>
    content
      .split(/\r?\n/)
      .find((line) => line.startsWith(`${key}=`))
      ?.split("=")
      .slice(1)
      .join("=")
      .trim();
  return {
    host: get("DB_HOST"),
    port: Number(get("DB_PORT")),
    user: get("DB_USER"),
    password: get("DB_PASSWORD"),
    database: get("DB_NAME"),
  };
}

function birthDateFor(ageMonths: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - ageMonths);
  return date.toISOString().slice(0, 10);
}

/** Igual que /comparar: "Seco"/"Húmedo" filtran; "Mixto" o vacío muestran todo. */
function typeFor(preference: VetCase["foodPreference"]): "seco" | "humedo" | "" {
  if (preference === "Seco") return "seco";
  if (preference === "Húmedo") return "humedo";
  return "";
}

function summarize(scored: ScoredFood, rank: number) {
  const { food } = scored;
  return {
    rank,
    id: food.id,
    brand: food.brand,
    name: food.name,
    type: food.type,
    stage: food.stage,
    size: food.size,
    conditions: food.conditions,
    protein: food.protein,
    fat: food.fat,
    fiber: food.fiber,
    moisture: food.moisture,
    proteinMs: food.proteinMs,
    fatMs: food.fatMs,
    fiberMs: food.fiberMs,
    kcalKg: food.kcalKg,
    kcalKgEstimated: food.kcalKgEstimated,
    firstIngredient: food.firstIngredient,
    priceMin: food.priceMin,
    priceStore: food.priceStore,
    priceUrl: food.priceUrl,
    score: Math.round(scored.score * 10) / 10,
    coverage: Math.round(scored.coverage),
    estimatedMonthlyCost: scored.estimatedMonthlyCost,
    positives: scored.positives,
    considerations: scored.considerations,
    warnings: scored.warnings,
    criteria: scored.criteria.map((c) => ({
      key: c.key,
      label: CRITERION_LABELS[c.key],
      score: c.score,
      explanation: c.explanation,
    })),
  };
}

let pool: Pool;
let catalog: FoodRow[];
let ranges: NutritionRange[];
let weights: RuleSetWeights;
const report: unknown[] = [];

beforeAll(async () => {
  pool = new Pool(readEnvLocal());
  [catalog, ranges, weights] = await Promise.all([
    getAllFoods(pool),
    getNutritionRanges(pool),
    getActiveRuleSetWeights(pool),
  ]);
});

afterAll(async () => {
  await pool?.end();
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        catalogSize: catalog?.length ?? 0,
        weights,
        cases: report,
      },
      null,
      2
    )
  );
  console.log(`\nReporte guardado en ${OUTPUT}`);
});

describe("casos para revisión veterinaria", () => {
  for (const vetCase of VET_CASES) {
    it(vetCase.title, () => {
      const birthDate = birthDateFor(vetCase.ageMonths);
      const pet = {
        species: vetCase.species,
        stage: petStage(birthDate),
        weightKg: vetCase.weightKg,
        activityLevel: vetCase.activityLevel,
        bodyCondition: vetCase.bodyCondition,
        specialCondition: vetCase.specialCondition,
        allergies: vetCase.allergies,
      };
      const result = compareFoods(pet, catalog, weights, vetCase.budget, ranges);
      const type = typeFor(vetCase.foodPreference);
      const shown = result.eligible.filter((s) => !type || s.food.type === type);
      const top = shown.slice(0, TOP_N);

      // Lo que nunca debe fallar, sin importar el criterio clínico.
      expect(top.length).toBeGreaterThan(0);
      const allergens = parseAllergyTokens(vetCase.allergies);
      for (const { food } of top) {
        expect(food.species).toBe(vetCase.species);
        if (type) expect(food.type).toBe(type);
        for (const allergen of allergens) expect(food.allergens[allergen]).toBe(false);
      }

      report.push({
        ...vetCase,
        birthDate,
        stage: pet.stage,
        candidates: shown.length,
        excludedByAllergy: result.excluded.filter((e) => e.reason === "alergia").length,
        top: top.map((s, i) => summarize(s, i + 1)),
      });
    });
  }
});

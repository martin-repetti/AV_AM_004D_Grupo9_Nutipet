import pool from "@/lib/db";
import { compareFoods } from "@/lib/compatibility/engine";
import { getActiveRuleSetWeights } from "@/lib/compatibility/ruleSet";
import type { ComparisonPet } from "@/lib/compatibility/types";
import { getAllFoods } from "@/services/foods";
import { getNutritionRanges } from "@/services/nutritionRanges";
import Hero, { type HeroPreview } from "@/components/home/Hero";
import HowItWorks, { type CatalogStats } from "@/components/home/HowItWorks";
import Benefits from "@/components/home/Benefits";

// Perfil de muestra para la vista previa del inicio. Es el mismo motor y
// el mismo catálogo que usa /comparar: los resultados son reales.
const SAMPLE_PET: ComparisonPet = {
  species: "Gato",
  stage: "adulto",
  weightKg: 4,
  activityLevel: "Moderada",
  bodyCondition: "Peso adecuado",
  specialCondition: null,
  allergies: null,
};

const PREVIEW_SIZE = 3;

export default async function Home() {
  const [catalog, nutritionRanges, weights] = await Promise.all([
    getAllFoods(pool),
    getNutritionRanges(pool),
    getActiveRuleSetWeights(pool),
  ]);

  const { eligible } = compareFoods(SAMPLE_PET, catalog, weights, null, nutritionRanges);

  const preview: HeroPreview = {
    profileLabel: "Gato adulto · 4 kg · actividad moderada",
    foods: eligible.slice(0, PREVIEW_SIZE).map(({ food, score }) => ({
      id: food.id,
      brand: food.brand,
      name: food.name,
      score,
      priceMin: food.priceMin,
    })),
  };

  const stores = new Set<string>();
  for (const food of catalog) {
    if (food.priceStore) stores.add(food.priceStore);
    for (const offer of food.pricesByFormat) if (offer.store) stores.add(offer.store);
  }
  stores.delete("sitio oficial de la marca");

  const stats: CatalogStats = {
    foods: catalog.length,
    brands: new Set(catalog.map((food) => food.brand)).size,
    stores: stores.size,
  };

  return (
    <main>
      <Hero preview={preview} />
      <HowItWorks stats={stats} />
      <Benefits />
    </main>
  );
}

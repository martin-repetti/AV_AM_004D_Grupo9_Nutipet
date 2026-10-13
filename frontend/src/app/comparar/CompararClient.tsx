"use client";

import { useMemo, useState } from "react";
import { compareFoods } from "@/lib/compatibility/engine";
import { petStage } from "@/lib/compatibility/petStage";
import { normalize } from "@/lib/compatibility/normalize";
import type { NutritionRange, RuleSetWeights } from "@/lib/compatibility/types";
import { ALLERGEN_LABELS, type FoodRow } from "@/types/catalogFood";
import { formatDisplayName } from "@/utils/productName";
import CatalogFoodCard from "@/components/compare/CatalogFoodCard";
import ComparisonTable from "@/components/compare/ComparisonTable";
import styles from "./Comparar.module.css";

export type ComparablePet = {
  id: number;
  name: string;
  species: "Perro" | "Gato";
  allergies: string | null;
  specialCondition: string | null;
  birthDate: string | null;
  weightKg: number | null;
  activityLevel: string | null;
  bodyCondition: string | null;
};

type CompararClientProps = {
  pets: ComparablePet[];
  catalog: FoodRow[];
  nutritionRanges: NutritionRange[];
  weights: RuleSetWeights;
};

const MAX_COMPARISON_ITEMS = 4;
const DEFAULT_COMPARISON_SIZE = 3;

export default function CompararClient({
  pets,
  catalog,
  nutritionRanges,
  weights,
}: CompararClientProps) {
  const [selectedPetId, setSelectedPetId] = useState(pets[0].id);
  const [budgetInput, setBudgetInput] = useState("");
  // null = todavía sin tocar la selección para esta mascota: se usan las
  // 3 mejores opciones por defecto. Al marcar/desmarcar algo, pasa a ser
  // una selección manual explícita.
  const [manualSelection, setManualSelection] = useState<number[] | null>(null);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0];

  const parsedBudget = budgetInput.trim() ? Number(budgetInput) : null;
  const budget = Number.isFinite(parsedBudget) ? parsedBudget : null;

  const { eligible, excluded, best, bestWithinBudget } = useMemo(
    () =>
      compareFoods(
        {
          species: selectedPet.species,
          stage: petStage(selectedPet.birthDate),
          weightKg: selectedPet.weightKg,
          activityLevel: selectedPet.activityLevel,
          bodyCondition: selectedPet.bodyCondition,
          specialCondition: selectedPet.specialCondition,
          allergies: selectedPet.allergies,
        },
        catalog,
        weights,
        budget,
        nutritionRanges
      ),
    [selectedPet, catalog, weights, budget, nutritionRanges]
  );

  const showBudgetCard =
    Boolean(bestWithinBudget) &&
    (!best || bestWithinBudget!.food.id !== best.food.id);

  const extraCost =
    showBudgetCard && best && bestWithinBudget && best.food.priceMin !== null && bestWithinBudget.food.priceMin !== null
      ? best.food.priceMin - bestWithinBudget.food.priceMin
      : 0;

  const defaultComparisonIds = useMemo(
    () => eligible.slice(0, DEFAULT_COMPARISON_SIZE).map((item) => item.food.id),
    [eligible]
  );

  const selectedFoodIds = manualSelection ?? defaultComparisonIds;

  const selectedForComparison = eligible.filter((item) =>
    selectedFoodIds.includes(item.food.id)
  );

  const toggleSelected = (foodId: number) => {
    setManualSelection((prev) => {
      const base = prev ?? defaultComparisonIds;
      if (base.includes(foodId)) return base.filter((id) => id !== foodId);
      if (base.length >= MAX_COMPARISON_ITEMS) return base;
      return [...base, foodId];
    });
  };

  const brands = useMemo(
    () => [...new Set(eligible.map((item) => item.food.brand))].sort(),
    [eligible]
  );

  const filteredEligible = eligible.filter((item) => {
    if (brandFilter && item.food.brand !== brandFilter) return false;

    if (search.trim()) {
      const term = normalize(search);
      const haystack = normalize(
        `${item.food.brand} ${item.food.name} ${item.food.firstIngredient ?? ""}`
      );
      if (!haystack.includes(term)) return false;
    }

    return true;
  });

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section>
          <h1>Comparar Alimentos</h1>

          <p>
            Encuentra los alimentos compatibles con las características de{" "}
            {selectedPet.name}.
          </p>

          <div className={styles.filtersRow}>
            <div className={styles.filterField}>
              <label htmlFor="pet">Mascota</label>

              <select
                id="pet"
                value={selectedPetId}
                onChange={(e) => {
                  setSelectedPetId(Number(e.target.value));
                  setManualSelection(null);
                }}
              >
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.species === "Gato" ? "🐱" : "🐶"} {pet.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterField}>
              <label htmlFor="budget">Presupuesto mensual (opcional)</label>

              <input
                id="budget"
                type="number"
                min="0"
                step="500"
                placeholder="Ej: 15000"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
            </div>
          </div>

          {selectedPet.allergies?.trim() && (
            <p className={styles.allergyNote}>
              Alergias registradas de {selectedPet.name}: {selectedPet.allergies}
            </p>
          )}
        </section>

        {excluded.some((item) => item.reason === "alergia") && (
          <section className={styles.excludedNote}>
            <strong>
              {excluded.filter((item) => item.reason === "alergia").length}
            </strong>{" "}
            alimento(s) descartado(s) por contener un alérgeno de{" "}
            {selectedPet.name}:{" "}
            {excluded
              .filter((item) => item.reason === "alergia")
              .map(
                (item) =>
                  `${item.food.brand} ${formatDisplayName(item.food.name)} (${ALLERGEN_LABELS[item.allergen!]})`
              )
              .join(", ")}
          </section>
        )}

        {eligible.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🚫</div>
            <h2>No encontramos alimentos sin alérgenos para {selectedPet.name}.</h2>
            <p>Revisa las alergias registradas en su perfil.</p>
          </div>
        ) : (
          <>
            <section className={styles.highlights}>
              {best && (
                <div className={styles.highlightCard}>
                  <span className={styles.highlightLabel}>
                    🏆 Mejor opción
                  </span>

                  <CatalogFoodCard scored={best} />
                </div>
              )}

              {showBudgetCard && bestWithinBudget && (
                <div className={styles.highlightCard}>
                  <span className={styles.highlightLabel}>
                    💰 Mejor opción según tu presupuesto
                  </span>

                  <CatalogFoodCard scored={bestWithinBudget} />
                </div>
              )}
            </section>

            {showBudgetCard && extraCost > 0 && best && (
              <p className={styles.compareNote}>
                Pagando ${extraCost.toLocaleString("es-CL")} más, puedes llevar{" "}
                <strong>{formatDisplayName(best.food.name)}</strong> en vez de{" "}
                <strong>{bestWithinBudget?.food.name && formatDisplayName(bestWithinBudget.food.name)}</strong>.
              </p>
            )}

            {budget !== null && !bestWithinBudget && (
              <p className={styles.compareNote}>
                Ningún alimento compatible con {selectedPet.name} entra en tu
                presupuesto mensual de ${budget.toLocaleString("es-CL")}.
              </p>
            )}

            {selectedForComparison.length > 0 && (
              <>
                <p className={styles.compareNote}>
                  {manualSelection
                    ? "Tu comparación personalizada:"
                    : `Tus ${selectedForComparison.length} mejores opciones para ${selectedPet.name}:`}
                </p>

                <ComparisonTable
                  items={selectedForComparison}
                  onRemove={toggleSelected}
                />
              </>
            )}

            <section>
              <h2>Todos los alimentos compatibles</h2>
              <p>
                Ordenados según compatibilidad. Marca hasta{" "}
                {MAX_COMPARISON_ITEMS} para compararlos en la tabla de arriba
                (empieza con las 3 mejores).
              </p>

              <div className={styles.filtersRow}>
                <div className={styles.filterField}>
                  <label htmlFor="search">Buscar alimento</label>

                  <input
                    id="search"
                    type="search"
                    placeholder="Nombre, marca o ingrediente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {brands.length > 1 && (
                  <div className={styles.filterField}>
                    <label htmlFor="brand">Marca</label>

                    <select
                      id="brand"
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                    >
                      <option value="">Todas las marcas</option>
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {filteredEligible.length === 0 ? (
                <p className={styles.compareNote}>
                  No encontramos alimentos que coincidan con tu búsqueda.
                </p>
              ) : (
                <div className={styles.list}>
                  {filteredEligible.map((item) => (
                    <CatalogFoodCard
                      key={item.food.id}
                      scored={item}
                      selectable
                      selected={selectedFoodIds.includes(item.food.id)}
                      onToggleSelect={() => toggleSelected(item.food.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { compareFoods } from "@/lib/foodMatch";
import { ALLERGEN_LABELS } from "@/types/catalogFood";
import CatalogFoodCard from "@/components/compare/CatalogFoodCard";
import styles from "./Comparar.module.css";

export type ComparablePet = {
  id: number;
  name: string;
  species: "Perro" | "Gato";
  allergies: string | null;
  specialCondition: string | null;
  birthDate: string | null;
};

type CompararClientProps = {
  pets: ComparablePet[];
};

export default function CompararClient({ pets }: CompararClientProps) {
  const [selectedPetId, setSelectedPetId] = useState(pets[0].id);
  const [budgetInput, setBudgetInput] = useState("");

  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0];

  const parsedBudget = budgetInput.trim() ? Number(budgetInput) : null;
  const budget = Number.isFinite(parsedBudget) ? parsedBudget : null;

  const { eligible, excluded, best, bestWithinBudget } = useMemo(
    () =>
      compareFoods(
        {
          species: selectedPet.species,
          allergies: selectedPet.allergies,
          specialCondition: selectedPet.specialCondition,
          birthDate: selectedPet.birthDate,
        },
        budget
      ),
    [selectedPet, budget]
  );

  const showBudgetCard =
    Boolean(bestWithinBudget) &&
    (!best || bestWithinBudget!.food.id !== best.food.id);

  const extraCost =
    showBudgetCard && best && bestWithinBudget
      ? best.food.price - bestWithinBudget.food.price
      : 0;

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
                onChange={(e) => setSelectedPetId(Number(e.target.value))}
              >
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.species === "Gato" ? "🐱" : "🐶"} {pet.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterField}>
              <label htmlFor="budget">Presupuesto máximo (opcional)</label>

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

        {excluded.length > 0 && (
          <section className={styles.excludedNote}>
            <strong>{excluded.length}</strong> alimento
            {excluded.length === 1 ? "" : "s"} descartado
            {excluded.length === 1 ? "" : "s"} por contener un alérgeno de{" "}
            {selectedPet.name}:{" "}
            {excluded
              .map(
                (item) =>
                  `${item.food.brand} ${item.food.name} (${ALLERGEN_LABELS[item.allergen]})`
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

                  <CatalogFoodCard
                    food={best.food}
                    score={best.score}
                    matchedStage={best.matchedStage}
                    matchedCondition={best.matchedCondition}
                  />
                </div>
              )}

              {showBudgetCard && bestWithinBudget && (
                <div className={styles.highlightCard}>
                  <span className={styles.highlightLabel}>
                    💰 Mejor opción según tu presupuesto
                  </span>

                  <CatalogFoodCard
                    food={bestWithinBudget.food}
                    score={bestWithinBudget.score}
                    matchedStage={bestWithinBudget.matchedStage}
                    matchedCondition={bestWithinBudget.matchedCondition}
                  />
                </div>
              )}
            </section>

            {showBudgetCard && extraCost > 0 && best && (
              <p className={styles.compareNote}>
                Pagando ${extraCost.toLocaleString("es-CL")} más, puedes llevar{" "}
                <strong>{best.food.name}</strong> en vez de{" "}
                <strong>{bestWithinBudget?.food.name}</strong>.
              </p>
            )}

            {budget !== null && !bestWithinBudget && (
              <p className={styles.compareNote}>
                Ningún alimento compatible con {selectedPet.name} entra en tu
                presupuesto de ${budget.toLocaleString("es-CL")}.
              </p>
            )}

            <section>
              <h2>Todos los alimentos compatibles</h2>
              <p>Ordenados según compatibilidad</p>

              <div className={styles.list}>
                {eligible.map((item) => (
                  <CatalogFoodCard
                    key={item.food.id}
                    food={item.food}
                    score={item.score}
                    matchedStage={item.matchedStage}
                    matchedCondition={item.matchedCondition}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

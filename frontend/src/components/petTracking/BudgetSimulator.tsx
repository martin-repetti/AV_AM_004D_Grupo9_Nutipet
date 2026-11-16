"use client";

import { useState } from "react";
import {
  dailyGrams,
  estimateEnergy,
  planOffers,
  type FeedingOffer,
  type FeedingPet,
} from "@/utils/feedingPlan";
import styles from "./BudgetSimulator.module.css";

export type SimulatorFood = {
  id: number;
  label: string;
  kcalKg: number | null;
  kcalKgEstimated: boolean;
  offers: FeedingOffer[];
};

type BudgetSimulatorProps = {
  petName: string;
  /** null si la mascota no tiene peso registrado. */
  pet: FeedingPet | null;
  foods: SimulatorFood[];
};

function money(value: number): string {
  return `$${value.toLocaleString("es-CL")}`;
}

export default function BudgetSimulator({ petName, pet, foods }: BudgetSimulatorProps) {
  const [foodId, setFoodId] = useState(foods[0]?.id ?? 0);
  const [gramsInput, setGramsInput] = useState("");
  const [budgetInput, setBudgetInput] = useState("");

  if (!pet) {
    return (
      <p className={styles.notice}>
        Registra el peso de {petName} para estimar cuánto come y cuánto gastarás al mes.
      </p>
    );
  }
  if (foods.length === 0) {
    return <p className={styles.notice}>No encontramos alimentos con precio para simular.</p>;
  }

  const food = foods.find((f) => f.id === foodId) ?? foods[0];
  const energy = estimateEnergy(pet);
  const suggestedGrams = food.kcalKg ? dailyGrams(energy.dailyKcal, food.kcalKg) : null;
  const customGrams = Number(gramsInput.replace(",", "."));
  const grams = gramsInput.trim() && customGrams > 0 ? customGrams : suggestedGrams;
  const plans = grams ? planOffers(grams, food.offers) : [];
  const budget = Number(budgetInput) > 0 ? Number(budgetInput) : null;
  const cheapest = plans[0];

  return (
    <div className={styles.simulator}>
      <div className={styles.controls}>
        <label>
          Alimento
          <select
            id="simFood"
            value={food.id}
            onChange={(e) => {
              setFoodId(Number(e.target.value));
              setGramsInput("");
            }}
          >
            {foods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ración diaria (g)
          <input
            id="simGrams"
            type="number"
            min="1"
            step="1"
            value={gramsInput}
            onChange={(e) => setGramsInput(e.target.value)}
            placeholder={suggestedGrams ? `Sugerida: ${suggestedGrams}` : "Ingresa la ración"}
          />
        </label>
        <label>
          Presupuesto mensual
          <input
            id="simBudget"
            type="number"
            min="0"
            step="500"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="Opcional"
          />
        </label>
      </div>

      <div className={styles.facts}>
        <div>
          <span>Energía diaria estimada</span>
          <strong>{energy.dailyKcal.toLocaleString("es-CL")} kcal</strong>
          <small>
            {energy.restingKcal} kcal en reposo × {String(energy.factor).replace(".", ",")} ({energy.factorReason})
          </small>
        </div>
        <div>
          <span>Ración diaria</span>
          <strong>{grams ? `${Math.round(grams)} g` : "—"}</strong>
          <small>
            {gramsInput.trim()
              ? "La que ingresaste"
              : food.kcalKg
                ? `Con ${Math.round(food.kcalKg).toLocaleString("es-CL")} kcal/kg${food.kcalKgEstimated ? " (estimado)" : ""}`
                : "Este alimento no informa su energía: ingresa la ración del envase"}
          </small>
        </div>
        <div>
          <span>Gasto mensual más bajo</span>
          <strong>{cheapest ? money(cheapest.monthlyCost) : "—"}</strong>
          <small>
            {cheapest
              ? `Formato ${cheapest.format}${cheapest.store ? ` en ${cheapest.store}` : ""}`
              : "Sin precios por formato para calcular"}
          </small>
        </div>
      </div>

      {plans.length > 0 && (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th scope="col">Formato</th>
                <th scope="col">Tienda</th>
                <th scope="col">Precio</th>
                <th scope="col">Dura</th>
                <th scope="col">Envases al mes</th>
                <th scope="col">Gasto mensual</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, index) => {
                const overBudget = budget !== null && plan.monthlyCost > budget;
                return (
                  <tr key={`${plan.store}-${plan.format}-${index}`} className={overBudget ? styles.over : undefined}>
                    <td>{plan.format}</td>
                    <td>
                      {plan.url ? (
                        <a href={plan.url} target="_blank" rel="noopener noreferrer">
                          {plan.store ?? "Ver tienda"} ↗
                        </a>
                      ) : (
                        plan.store ?? "—"
                      )}
                    </td>
                    <td>{money(plan.price)}</td>
                    <td>{plan.daysPerPack} días</td>
                    <td>{plan.packsPerMonth}</td>
                    <td>
                      <strong>{money(plan.monthlyCost)}</strong>
                      {budget !== null && (
                        <span className={overBudget ? styles.tagOver : styles.tagOk}>
                          {overBudget ? `+${money(plan.monthlyCost - budget)}` : "Dentro del presupuesto"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className={styles.note}>
        Estimación orientativa con la fórmula de requerimiento energético (RER × factor según
        etapa, esterilización, actividad y condición). La ración adecuada la define tu veterinario.
        El gasto mensual considera lo que se consume en el mes; “envases al mes” es cuántos tendrías que
        comprar.
      </p>
    </div>
  );
}

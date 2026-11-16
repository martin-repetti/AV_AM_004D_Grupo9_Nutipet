"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FoodLog, WeightLog } from "@/services/petTracking";
import { formatHistoryDate } from "@/utils/priceHistory";
import WeightChart from "./WeightChart";
import styles from "./PetTracker.module.css";

export type FoodOption = { id: number; label: string };

type PetTrackerProps = {
  petId: number;
  petName: string;
  weights: WeightLog[];
  foods: FoodLog[];
  foodOptions: FoodOption[];
};

const OTHER_FOOD = "otro";

function today(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
}

export default function PetTracker({ petId, petName, weights, foods, foodOptions }: PetTrackerProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [weightKg, setWeightKg] = useState("");
  const [weightDate, setWeightDate] = useState(today);
  const [weightNote, setWeightNote] = useState("");

  const [foodChoice, setFoodChoice] = useState(foodOptions[0] ? String(foodOptions[0].id) : OTHER_FOOD);
  const [foodName, setFoodName] = useState("");
  const [foodDate, setFoodDate] = useState(today);

  const send = async (url: string, init: RequestInit, onDone?: () => void) => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(url, init);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "No se pudo guardar el cambio.");
        return;
      }
      onDone?.();
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servidor. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  };

  const addWeight = (e: React.FormEvent) => {
    e.preventDefault();
    send(
      `/api/pets/${petId}/weights`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: Number(weightKg.replace(",", ".")), recordedOn: weightDate, note: weightNote }),
      },
      () => {
        setWeightKg("");
        setWeightNote("");
      }
    );
  };

  const addFood = (e: React.FormEvent) => {
    e.preventDefault();
    const other = foodChoice === OTHER_FOOD;
    send(
      `/api/pets/${petId}/foods`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId: other ? null : Number(foodChoice), foodName: other ? foodName : "", startedOn: foodDate }),
      },
      () => setFoodName("")
    );
  };

  const latest = weights[weights.length - 1];
  const previous = weights[weights.length - 2];
  const change = latest && previous ? Math.round((latest.weightKg - previous.weightKg) * 100) / 100 : null;

  return (
    <div className={styles.tracker}>
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3>Evolución del peso</h3>
            {latest && (
              <p className={styles.summary}>
                Último registro: <strong>{latest.weightKg} kg</strong> ({formatHistoryDate(latest.recordedOn)})
                {change !== null && change !== 0 && (
                  <span className={change > 0 ? styles.up : styles.down}>
                    {" "}
                    {change > 0 ? "+" : ""}
                    {String(change).replace(".", ",")} kg desde el anterior
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <WeightChart weights={weights} foods={foods} />
        <p className={styles.disclaimer}>
          El peso puede cambiar por muchas razones (edad, actividad, salud, cantidad de comida). Este
          registro muestra cuándo cambió el alimento, pero no atribuye el cambio de peso a un producto.
          Ante cambios bruscos, consulta a tu veterinario.
        </p>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.columns}>
        <section className={styles.panel}>
          <h3>Registrar peso</h3>
          <form className={styles.form} onSubmit={addWeight}>
            <div className={styles.row}>
              <label>
                Peso (kg)
                <input
                  id="weightKg"
                  type="number"
                  min="0.1"
                  max="150"
                  step="0.01"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="Ej: 4,2"
                  required
                />
              </label>
              <label>
                Fecha
                <input
                  id="weightDate"
                  type="date"
                  value={weightDate}
                  max={today()}
                  onChange={(e) => setWeightDate(e.target.value)}
                  required
                />
              </label>
            </div>
            <label>
              Nota (opcional)
              <input
                id="weightNote"
                type="text"
                maxLength={200}
                value={weightNote}
                onChange={(e) => setWeightNote(e.target.value)}
                placeholder="Ej: control en la veterinaria"
              />
            </label>
            <button type="submit" disabled={busy}>
              Guardar peso
            </button>
          </form>

          {weights.length > 0 && (
            <ul className={styles.list}>
              {[...weights].reverse().map((log) => (
                <li key={log.id}>
                  <span>
                    <strong>{log.weightKg} kg</strong> · {formatHistoryDate(log.recordedOn)}
                    {log.note && <small>{log.note}</small>}
                  </span>
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Eliminar registro de ${log.weightKg} kg del ${formatHistoryDate(log.recordedOn)}`}
                    onClick={() => send(`/api/pets/${petId}/weights/${log.id}`, { method: "DELETE" })}
                    disabled={busy}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <h3>Cambios de alimento</h3>
          <form className={styles.form} onSubmit={addFood}>
            <label>
              Alimento que empezó a comer {petName}
              <select id="foodChoice" value={foodChoice} onChange={(e) => setFoodChoice(e.target.value)}>
                {foodOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
                <option value={OTHER_FOOD}>Otro (escribir el nombre)</option>
              </select>
            </label>
            {foodChoice === OTHER_FOOD && (
              <label>
                Nombre del alimento
                <input
                  id="foodName"
                  type="text"
                  maxLength={300}
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="Ej: Comida casera indicada por el veterinario"
                  required
                />
              </label>
            )}
            <label>
              Desde
              <input
                id="foodDate"
                type="date"
                value={foodDate}
                max={today()}
                onChange={(e) => setFoodDate(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={busy}>
              Registrar cambio
            </button>
          </form>

          {foods.length > 0 && (
            <ol className={styles.list}>
              {foods.map((log, index) => (
                <li key={log.id}>
                  <span>
                    <b className={styles.badge}>{index + 1}</b>
                    <strong>{log.foodName}</strong> · desde {formatHistoryDate(log.startedOn)}
                  </span>
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Eliminar el cambio a ${log.foodName}`}
                    onClick={() => send(`/api/pets/${petId}/foods/${log.id}`, { method: "DELETE" })}
                    disabled={busy}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

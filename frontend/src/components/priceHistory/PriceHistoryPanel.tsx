"use client";

import { useEffect, useMemo, useState } from "react";
import type { PriceHistoryFood, PriceRecord } from "@/types/priceHistory";
import { formatDisplayName } from "@/utils/productName";
import {
  defaultHistoryFormat,
  formatHistoryDate,
  historyFormats,
  historySeries,
  historyStats,
  latestPriceByStore,
} from "@/utils/priceHistory";
import styles from "./PriceHistoryPanel.module.css";

const MAX_BAR_HEIGHT = 160;
// La barra del precio más bajo no parte de cero: así se nota una
// diferencia de $500 entre $10.490 y $10.990.
const MIN_BAR_HEIGHT = 48;
const SEARCH_DELAY_MS = 250;

type PriceHistoryPanelProps = {
  /** Si se entregan, se muestran primero como accesos rápidos. */
  favorites?: PriceHistoryFood[];
  initialFood: PriceHistoryFood | null;
};

function money(value: number): string {
  return `$${value.toLocaleString("es-CL")}`;
}

function foodLabel(food: PriceHistoryFood): string {
  // Algunos productos del scraper vienen sin marca.
  const name = formatDisplayName(food.name);
  return food.brand ? `${food.brand} — ${name}` : name;
}

export default function PriceHistoryPanel({ favorites = [], initialFood }: PriceHistoryPanelProps) {
  const [selected, setSelected] = useState<PriceHistoryFood | null>(initialFood);
  const [history, setHistory] = useState<{ foodId: number; records: PriceRecord[] | null } | null>(
    null
  );
  const [formatChoice, setFormatChoice] = useState<{ foodId: number; format: string } | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ query: string; foods: PriceHistoryFood[] } | null>(null);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;

    fetch(`/api/foods/${selected.id}/price-history`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { records: PriceRecord[] }) => {
        if (!cancelled) setHistory({ foodId: selected.id, records: data.records });
      })
      .catch(() => {
        if (!cancelled) setHistory({ foodId: selected.id, records: null });
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  const trimmedQuery = query.trim();
  useEffect(() => {
    if (trimmedQuery.length < 2) return;
    let cancelled = false;

    const timer = setTimeout(() => {
      fetch(`/api/foods/search?q=${encodeURIComponent(trimmedQuery)}`)
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((data: { foods: PriceHistoryFood[] }) => {
          if (!cancelled) setResults({ query: trimmedQuery, foods: data.foods });
        })
        .catch(() => {
          if (!cancelled) setResults({ query: trimmedQuery, foods: [] });
        });
    }, SEARCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedQuery]);

  const loading = !!selected && history?.foodId !== selected.id;
  const records = !loading ? (history?.records ?? null) : null;
  const formats = useMemo(() => historyFormats(records ?? []), [records]);

  const format =
    formatChoice && formatChoice.foodId === selected?.id && formats.includes(formatChoice.format)
      ? formatChoice.format
      : defaultHistoryFormat(records ?? []);

  const series = useMemo(
    () => (records && format !== null ? historySeries(records, format) : []),
    [records, format]
  );
  const stats = historyStats(series);
  const stores = records && format !== null ? latestPriceByStore(records, format) : [];

  const choose = (food: PriceHistoryFood) => {
    setSelected(food);
    setQuery("");
    setResults(null);
  };

  const showResults = trimmedQuery.length >= 2;
  const searching = showResults && results?.query !== trimmedQuery;

  return (
    <div>
      <div className={styles.picker}>
        {favorites.length > 0 && (
          <div className={styles.quickPicks}>
            <span className={styles.pickerLabel}>Tus favoritos</span>
            <div className={styles.chips}>
              {favorites.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  className={`${styles.chip} ${selected?.id === food.id ? styles.chipActive : ""}`}
                  aria-pressed={selected?.id === food.id}
                  onClick={() => choose(food)}
                >
                  {foodLabel(food)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.search}>
          <label htmlFor="historySearch" className={styles.pickerLabel}>
            {favorites.length > 0 ? "Otro alimento" : "Buscar alimento"}
          </label>
          <input
            id="historySearch"
            type="search"
            placeholder="Marca o nombre, ej: Royal Canin gato"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />

          {showResults && (
            <ul className={styles.results} role="listbox" aria-label="Resultados de búsqueda">
              {searching ? (
                <li className={styles.resultsNote}>Buscando…</li>
              ) : results && results.foods.length > 0 ? (
                results.foods.map((food) => (
                  <li key={food.id}>
                    <button type="button" role="option" aria-selected={false} onClick={() => choose(food)}>
                      <span className={styles.resultBrand}>{food.brand}</span>
                      {formatDisplayName(food.name)}
                    </button>
                  </li>
                ))
              ) : (
                <li className={styles.resultsNote}>No encontramos alimentos con “{trimmedQuery}”.</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {!selected ? (
        <p className={styles.noHistory}>Busca un alimento para ver cómo ha variado su precio.</p>
      ) : loading ? (
        <p className={styles.noHistory}>Cargando historial…</p>
      ) : records === null ? (
        <p className={styles.noHistory}>No pudimos cargar el historial. Intenta de nuevo más tarde.</p>
      ) : !stats || format === null ? (
        <p className={styles.noHistory}>
          Todavía no tenemos precios registrados para {foodLabel(selected)}.
        </p>
      ) : (
        <>
          <div className={styles.titleRow}>
            <h2 className={styles.foodTitle}>{foodLabel(selected)}</h2>

            {formats.length > 1 && (
              <div className={styles.formatSelect}>
                <label htmlFor="historyFormat">Formato</label>
                <select
                  id="historyFormat"
                  value={format}
                  onChange={(e) => setFormatChoice({ foodId: selected.id, format: e.target.value })}
                >
                  {formats.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span>Precio actual{format ? ` (${format})` : ""}</span>
              <strong>{money(stats.current)}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Precio mínimo</span>
              <strong>{money(stats.min)}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Precio máximo</span>
              <strong>{money(stats.max)}</strong>
            </div>
            <div
              className={`${styles.statCard} ${
                stats.variation === null
                  ? ""
                  : stats.variation > 0
                    ? styles.statBad
                    : styles.statGood
              }`}
            >
              <span>Variación</span>
              <strong>
                {stats.variation === null
                  ? "—"
                  : `${stats.variation > 0 ? "+" : ""}${stats.variation.toFixed(1)}%`}
              </strong>
            </div>
          </div>

          {series.length === 1 && (
            <p className={styles.singlePointNote}>
              Por ahora solo tenemos el precio del {formatHistoryDate(series[0].date)}. Cada vez que
              actualizamos el catálogo se registra un nuevo precio, y aquí verás cómo cambia.
            </p>
          )}

          <section className={styles.chartCard}>
            <h3>Evolución del precio más bajo{format ? ` · ${format}` : ""}</h3>

            <div className={styles.chart}>
              {series.map((point) => {
                const range = stats.max - stats.min;
                const height =
                  range > 0
                    ? MIN_BAR_HEIGHT + ((point.price - stats.min) / range) * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT)
                    : MAX_BAR_HEIGHT;
                return (
                  <div key={point.date} className={styles.bar} title={`${money(point.price)} en ${point.store}`}>
                    <span className={styles.barValue}>{money(point.price)}</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ height: `${height}px` }} />
                    </div>
                    <span className={styles.barLabel}>{formatHistoryDate(point.date)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.historyCard}>
            <h3>Último precio por tienda</h3>
            <ul>
              {stores.map((record) => (
                <li key={record.store}>
                  <span>
                    {record.url ? (
                      <a href={record.url} target="_blank" rel="noopener noreferrer">
                        {record.store || "Tienda no especificada"} ↗
                      </a>
                    ) : (
                      record.store || "Tienda no especificada"
                    )}
                    <small> · {formatHistoryDate(record.date)}</small>
                  </span>
                  <strong>{money(record.price)}</strong>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/** Convierte "2026-04" en "Abr 2026". */
export function formatMonthLabel(month: string): string {
  const [year, monthIndex] = month.split("-");
  const label = MONTH_LABELS[Number(monthIndex) - 1] ?? month;
  return `${label} ${year}`;
}

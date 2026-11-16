/** Qué incluye cada plan. Lo usan la página de planes y los avisos de "función Premium". */
export type PlanFeature = {
  key: string;
  title: string;
  description: string;
  free: string | boolean;
  premium: string | boolean;
};

export const PLAN_FEATURES: PlanFeature[] = [
  {
    key: "recomendaciones",
    title: "Recomendaciones personalizadas",
    description: "Alimentos ordenados por compatibilidad con la explicación de cada puntaje.",
    free: true,
    premium: true,
  },
  {
    key: "mascotas",
    title: "Mascotas registradas",
    description: "Perfiles guardados con sus características y necesidades.",
    free: "Hasta 2",
    premium: "Hasta 10",
  },
  {
    key: "favoritos",
    title: "Favoritos e historial de precios",
    description: "Guarda alimentos y revisa cómo cambia su precio.",
    free: true,
    premium: true,
  },
  {
    key: "comparacion",
    title: "Comparación avanzada",
    description: "Más alimentos lado a lado y diferencias nutricionales detalladas: materia seca, energía, humedad y alérgenos.",
    free: "Hasta 4, datos básicos",
    premium: "Hasta 6, detalle completo",
  },
  {
    key: "presupuesto",
    title: "Simulador de presupuesto mensual",
    description: "Cuánto comerá tu mascota al mes, cuántos envases necesitas y cuánto gastarás según el formato y la tienda.",
    free: false,
    premium: true,
  },
  {
    key: "alertas",
    title: "Alertas de precio",
    description: "Te avisamos cuando un favorito baja de precio o llega a su precio más bajo registrado.",
    free: false,
    premium: true,
  },
  {
    key: "peso",
    title: "Historial de peso",
    description: "Registra el peso de tu mascota y mira su evolución en un gráfico.",
    free: false,
    premium: true,
  },
  {
    key: "seguimiento",
    title: "Seguimiento nutricional",
    description: "Anota los cambios de alimento y míralos junto a la evolución del peso.",
    free: false,
    premium: true,
  },
  {
    key: "reporte",
    title: "Reporte descargable",
    description: "Resumen de tu mascota con su peso, alimentación y alimentos recomendados, para guardar o llevar al veterinario.",
    free: false,
    premium: true,
  },
];

export function featureByKey(key: string): PlanFeature {
  const feature = PLAN_FEATURES.find((f) => f.key === key);
  if (!feature) throw new Error(`Beneficio desconocido: ${key}`);
  return feature;
}

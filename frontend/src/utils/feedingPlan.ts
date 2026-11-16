import { parseFormatToKg } from "@/utils/formatSize";

/**
 * Simulador de gasto mensual. La energía diaria se estima como
 * RER × factor (RER = 70 × peso^0,75, la fórmula estándar de requerimiento
 * en reposo; los factores son los de referencia habituales, NRC/WSAVA).
 * Es una estimación orientativa: la ración real la define el veterinario.
 */

export type FeedingPet = {
  species: "Perro" | "Gato";
  weightKg: number;
  /** Edad en meses; null si no se conoce. */
  ageMonths: number | null;
  sterilized: boolean | null;
  activityLevel: string | null;
  bodyCondition: string | null;
};

export type EnergyEstimate = {
  restingKcal: number;
  factor: number;
  dailyKcal: number;
  /** Por qué se eligió ese factor, para mostrarlo. */
  factorReason: string;
};

const DAYS_PER_MONTH = 30.4;

export function energyFactor(pet: FeedingPet): { factor: number; reason: string } {
  const months = pet.ageMonths;
  const dog = pet.species === "Perro";

  if (months !== null && months < 12) {
    if (dog) {
      return months < 4
        ? { factor: 3, reason: "cachorro menor de 4 meses" }
        : { factor: 2, reason: "cachorro de 4 a 12 meses" };
    }
    return { factor: 2.5, reason: "gatito en crecimiento" };
  }

  if (pet.bodyCondition === "Sobrepeso") {
    return dog
      ? { factor: 1.4, reason: "adulto con sobrepeso" }
      : { factor: 1, reason: "adulto con sobrepeso" };
  }

  const senior = months !== null && months >= (dog ? 84 : 132);
  let factor: number;
  let reason: string;
  if (senior) {
    factor = dog ? 1.4 : 1.1;
    reason = "adulto mayor";
  } else if (pet.sterilized) {
    factor = dog ? 1.6 : 1.2;
    reason = "adulto esterilizado";
  } else {
    factor = dog ? 1.8 : 1.4;
    reason = pet.sterilized === false ? "adulto no esterilizado" : "adulto";
  }

  if (pet.activityLevel === "Alta") {
    factor += dog ? 0.4 : 0.2;
    reason += ", actividad alta";
  } else if (pet.activityLevel === "Baja") {
    factor -= 0.2;
    reason += ", actividad baja";
  }
  if (pet.bodyCondition === "Bajo peso") {
    factor += 0.2;
    reason += ", bajo peso";
  }

  return { factor: Math.max(1, Math.round(factor * 10) / 10), reason };
}

export function estimateEnergy(pet: FeedingPet): EnergyEstimate {
  const restingKcal = 70 * Math.pow(pet.weightKg, 0.75);
  const { factor, reason } = energyFactor(pet);
  return {
    restingKcal: Math.round(restingKcal),
    factor,
    dailyKcal: Math.round(restingKcal * factor),
    factorReason: reason,
  };
}

/** Gramos diarios para cubrir dailyKcal con un alimento de kcalKg. */
export function dailyGrams(dailyKcal: number, kcalKg: number): number {
  return Math.round((dailyKcal / kcalKg) * 1000);
}

export type FeedingOffer = {
  format: string;
  price: number;
  store: string | null;
  url: string | null;
};

export type OfferPlan = FeedingOffer & {
  formatKg: number;
  /** Cuántos días dura un envase. */
  daysPerPack: number;
  /** Envases que hay que comprar en un mes (redondeado hacia arriba). */
  packsPerMonth: number;
  /** Gasto del mes según lo que realmente se consume (precio por kilo × kilos). */
  monthlyCost: number;
};

/**
 * Plan de compra por cada oferta con formato conocido, del más barato al
 * mes al más caro. Las ofertas sin tamaño (no se sabe cuánto alimento
 * trae el precio) no se pueden simular y se omiten.
 */
export function planOffers(gramsPerDay: number, offers: FeedingOffer[]): OfferPlan[] {
  if (gramsPerDay <= 0) return [];
  const kgPerMonth = (gramsPerDay * DAYS_PER_MONTH) / 1000;

  const plans: OfferPlan[] = [];
  for (const offer of offers) {
    const formatKg = parseFormatToKg(offer.format);
    if (!formatKg || offer.price <= 0) continue;
    plans.push({
      ...offer,
      formatKg,
      daysPerPack: Math.max(1, Math.floor((formatKg * 1000) / gramsPerDay)),
      packsPerMonth: Math.ceil(kgPerMonth / formatKg),
      monthlyCost: Math.round((offer.price / formatKg) * kgPerMonth),
    });
  }
  return plans.sort((a, b) => a.monthlyCost - b.monthlyCost);
}

/** Edad en meses a partir de "YYYY-MM-DD" (o del Date que entrega pg para columnas DATE). */
export function ageInMonths(birthDate: string | Date | null, today = new Date()): number | null {
  if (!birthDate) return null;
  const birth =
    birthDate instanceof Date
      ? new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      : new Date(`${birthDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const months =
    (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth()) -
    (today.getDate() < birth.getDate() ? 1 : 0);
  return Math.max(0, months);
}

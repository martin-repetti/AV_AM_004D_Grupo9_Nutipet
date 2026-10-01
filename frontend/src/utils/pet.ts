export function speciesIcon(species: string) {
  return species === "Gato" ? "🐱" : "🐶";
}

export function formatAge(birthDate: string | Date | null) {
  if (!birthDate) return "Edad no indicada";

  const birth = new Date(birthDate);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years -= 1;
  }

  if (years <= 0) return "Menos de 1 año";
  return years === 1 ? "1 año" : `${years} años`;
}

export function formatWeight(weightKg: string | number | null) {
  if (weightKg === null || weightKg === undefined) return "Peso no indicado";

  const value = typeof weightKg === "string" ? Number(weightKg) : weightKg;
  if (!Number.isFinite(value)) return "Peso no indicado";

  return `${value.toLocaleString("es-CL")} kg`;
}

export function formatBreed(pet: {
  breed: string | null;
  custom_breed: string | null;
}) {
  if (pet.custom_breed) return pet.custom_breed;
  if (pet.breed) return pet.breed;
  return "Raza no indicada";
}

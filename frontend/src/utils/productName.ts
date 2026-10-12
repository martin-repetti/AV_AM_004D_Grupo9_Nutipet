// Conectores en español que se dejan en minúscula en formato título,
// salvo que sean la primera palabra.
const LOWERCASE_WORDS = new Set([
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "y",
  "o",
  "a",
  "en",
  "con",
  "para",
  "por",
  "sin",
]);

/**
 * Varios productos (sobre todo Fit Formula) vienen con el nombre en
 * MAYÚSCULAS sostenidas porque así está el título en el sitio del
 * fabricante — el scraper no tiene un nombre "lindo" alternativo para
 * usar. Esto solo mejora cómo se MUESTRA el nombre (formato título); el
 * dato guardado en la base no cambia.
 */
export function formatDisplayName(name: string): string {
  if (name !== name.toUpperCase()) return name;

  return name
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

import { describe, expect, it } from "vitest";
import { codesForSpecialCondition, foodConditionCodes } from "../conditions";

describe("condiciones del alimento", () => {
  it("las detecta en el nombre cuando el scraper no las etiquetó", () => {
    const codes = foodConditionCodes({ conditions: [], name: "Royal Canin Urinary S/O Gato" });
    expect(codes.has("urinario")).toBe(true);
  });

  it("no confunde una palabra que solo contiene la clave", () => {
    const codes = foodConditionCodes({ conditions: [], name: "Fancy Feast Delight Salmón" });
    expect(codes.has("control_peso")).toBe(false);
  });

  it("conserva las etiquetas del scraper", () => {
    expect(foodConditionCodes({ conditions: ["grain_free"], name: "X" }).has("grain_free")).toBe(true);
  });
});

describe("necesidad especial de la mascota", () => {
  it("relaciona cada opción del formulario con los códigos del catálogo", () => {
    expect(codesForSpecialCondition("Sensibilidad digestiva")).toEqual(["digestivo", "sensible"]);
    expect(codesForSpecialCondition("Cuidado urinario")).toEqual(["urinario"]);
    expect(codesForSpecialCondition("Piel y pelaje")).toEqual(["piel_pelaje", "hipoalergenico"]);
    expect(codesForSpecialCondition("Articulaciones")).toEqual(["articulaciones"]);
    expect(codesForSpecialCondition("Control de peso")).toEqual(["control_peso"]);
    expect(codesForSpecialCondition(null)).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { mergeProducts, normalizeFormat, sizeFromName, stripSize } from "../merge-products.js";

function item(overrides = {}) {
  return {
    marca: "Taste of the Wild",
    nombre: "Ancient Grains Prairie 12,7 kg",
    especie: "perro",
    clasificacion: { tipo: "seco", etapa: "", tamano: "", condiciones: [] },
    nutricion: { proteina: null, grasa: null },
    ingredientes: { originales: "", contiene: {} },
    formatos: ["12.7 kg"],
    ofertas: [],
    precios_por_formato: [],
    precio_min: 53990,
    fuente: { tipo: "catálogo braloy.cl", url: "https://braloy.cl/a" },
    ...overrides,
  };
}

describe("tamaños en el nombre", () => {
  it("normaliza formatos", () => {
    expect(normalizeFormat("12,7 kg")).toBe("12.7 kg");
    expect(normalizeFormat("1250 Gr")).toBe("1.25 kg");
    expect(normalizeFormat("0,3 kg")).toBe("300 g");
    expect(normalizeFormat("10 lb")).toBeNull();
  });

  it("extrae el tamaño solo si hay exactamente uno", () => {
    expect(sizeFromName("Ancient Grains Prairie 12,7 kg")).toBe("12.7 kg");
    expect(sizeFromName("Royal Canin Adulto 4 kg.")).toBe("4 kg");
    expect(sizeFromName("Pack 3×2 Tiki Cat 80 Gr")).toBe("80 g");
    expect(sizeFromName("Sin tamaño")).toBeNull();
  });

  it("no confunde palabras que empiezan con g con gramos", () => {
    expect(sizeFromName("Omega 3 grasas saludables")).toBeNull();
  });

  it("quita el tamaño del nombre a mostrar", () => {
    expect(stripSize("Bravery Light Receta Cerdo, 7 kg")).toBe("Bravery Light Receta Cerdo");
    expect(stripSize("Royal Canin Adulto Sterilised Gato 4 kg.")).toBe("Royal Canin Adulto Sterilised Gato");
  });
});

describe("mergeProducts", () => {
  it("une los tamaños de un mismo producto y conserva cada tamaño como oferta", () => {
    const merged = mergeProducts([
      item({ nombre: "Ancient Grains Prairie 12,7 kg", precio_min: 53990, ofertas: [{ tienda: "braloy.cl", precio: 53990, formato: "", url: "u1" }] }),
      item({ nombre: "Ancient Grains Prairie 6,35 kg", precio_min: 32990, ofertas: [{ tienda: "braloy.cl", precio: 32990, formato: "", url: "u2" }] }),
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].nombre).toBe("Ancient Grains Prairie");
    expect(merged[0].precio_min).toBe(32990);
    expect(merged[0].ofertas.map((o) => o.formato).sort()).toEqual(["12.7 kg", "6.35 kg"]);
  });

  it("toma la nutrición del registro más completo, aunque venga de otra tienda", () => {
    const merged = mergeProducts([
      item({ fuente: { tipo: "catálogo razaspet.cl" } }),
      item({
        nombre: "Ancient Grains Prairie",
        nutricion: { proteina: 25, grasa: 15 },
        ingredientes: { originales: "Carne de vacuno", contiene: { vacuno: true } },
        fuente: { tipo: "catálogo happymascota.cl" },
      }),
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].nutricion.proteina).toBe(25);
    expect(merged[0].ingredientes.contiene.vacuno).toBe(true);
  });

  it("no une productos de distinta especie ni de distinto tipo", () => {
    const merged = mergeProducts([
      item(),
      item({ especie: "gato" }),
      item({ clasificacion: { tipo: "humedo" } }),
    ]);
    expect(merged).toHaveLength(3);
  });

  it("descarta una lista de formatos inflada y usa solo los de sus ofertas y su nombre", () => {
    const inflated = Array.from({ length: 24 }, (_, i) => `${i + 1} kg`);
    const [merged] = mergeProducts([
      item({
        nombre: "Classic Prairie Poultry, 9.7 kg",
        formatos: inflated,
        ofertas: [{ tienda: "petco.cl", precio: 56800, formato: "9.7 kg", url: "u" }],
      }),
    ]);
    expect(merged.formatos).toEqual(["9.7 kg"]);
  });

  it("prefiere los tamaños con precio o en el nombre a la lista del scraper", () => {
    const [merged] = mergeProducts([
      item({ nombre: "Acana Pork & Squash 2 kg", formatos: ["2 kg", "35 g", "25 kg"] }),
      item({ nombre: "Acana Pork & Squash 11,4 kg", formatos: ["11.4 kg", "400 g"] }),
    ]);
    expect(merged.formatos).toEqual(["2 kg", "11.4 kg"]);
  });

  it("no repite el mismo tamaño escrito en distinta unidad", () => {
    const [merged] = mergeProducts([
      item({
        nombre: "Matisse Gato Mousse Salmón (300 g)",
        ofertas: [{ tienda: "a.cl", precio: 2990, formato: "0.3 kg", url: "u" }],
      }),
    ]);
    expect(merged.nombre).toBe("Matisse Gato Mousse Salmón");
    expect(merged.formatos).toEqual(["300 g"]);
  });
});

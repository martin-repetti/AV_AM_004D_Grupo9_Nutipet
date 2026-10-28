/** Un precio registrado (tabla `food_price_history`): una tienda, un formato, un día. */
export type PriceRecord = {
  /** "YYYY-MM-DD", el día en que el scraper leyó el precio. */
  date: string;
  store: string;
  /** "" cuando la tienda no indica a qué tamaño corresponde el precio. */
  format: string;
  price: number;
  url: string | null;
};

export type PriceHistoryFood = {
  id: number;
  brand: string;
  name: string;
};

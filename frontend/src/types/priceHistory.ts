export type PricePoint = {
  /** Formato "YYYY-MM". */
  month: string;
  price: number;
};

export type PriceHistory = {
  foodId: number;
  points: PricePoint[];
};

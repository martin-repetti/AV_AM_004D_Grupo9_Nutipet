export type Food = {
  id: number;
  name: string;
  brand: string;
  /**
   * Valor demostrativo (0-100). El cálculo real de compatibilidad se
   * implementará en el backend a partir de las características de la
   * mascota y del alimento.
   */
  compatibility: number;
  price: number;
  protein: number;
  fat: number;
  hasColorants: boolean;
};

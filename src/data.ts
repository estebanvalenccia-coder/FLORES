export type Flower = {
  id: string;
  name: string;
  category: string;
  buy: number;
  sell: number;
  stock: number;
  unit: string;
};

export const initialFlowers: Flower[] = [
  { id: "rosa-roja", name: "Rosa roja", category: "Flor principal", buy: 1.2, sell: 3.5, stock: 80, unit: "unidad" },
  { id: "tulipan-blanco", name: "Tulipán blanco", category: "Flor principal", buy: 1.4, sell: 3.8, stock: 45, unit: "unidad" },
  { id: "eucalipto", name: "Eucalipto", category: "Verde decorativo", buy: 0.7, sell: 2.2, stock: 120, unit: "tallo" },
  { id: "paniculata", name: "Paniculata", category: "Relleno", buy: 0.5, sell: 1.8, stock: 95, unit: "tallo" }
];

export function money(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number.isFinite(value) ? value : 0);
}

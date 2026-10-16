export const productIds = [
  "ethiopia-yirgacheffe",
  "colombia-huila",
  "brazil-cerrado",
  "drip-assortment",
] as const;
export type ProductId = (typeof productIds)[number];

export interface CoffeeProduct {
  id: ProductId;
  price: number;
  image: string;
  accent: "sage" | "clay" | "ochre" | "forest";
  package: { kind: "grams" | "bags"; count: number };
}

export const products: readonly CoffeeProduct[] = [
  {
    id: "ethiopia-yirgacheffe",
    price: 32,
    image: "/images/ethiopia-v2.png",
    accent: "sage",
    package: {
      kind: "grams",
      count: 250,
    },
  },
  {
    id: "colombia-huila",
    price: 29,
    image: "/images/colombia-v3.png",
    accent: "clay",
    package: {
      kind: "grams",
      count: 250,
    },
  },
  {
    id: "brazil-cerrado",
    price: 26,
    image: "/images/brazil-v2.png",
    accent: "ochre",
    package: {
      kind: "grams",
      count: 250,
    },
  },
  {
    id: "drip-assortment",
    price: 18,
    image: "/images/drips.png",
    accent: "forest",
    package: {
      kind: "bags",
      count: 10,
    },
  },
];

export function getProduct(id: ProductId | null) {
  return products.find((product) => product.id === id);
}

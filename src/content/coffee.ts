export const productIds = [
  "ethiopia-yirgacheffe",
  "colombia-huila",
  "brazil-cerrado",
  "drip-assortment",
] as const;
export type ProductId = (typeof productIds)[number];

export interface CoffeeProduct {
  id: ProductId;
  name: string;
  origin: string;
  notes: string;
  detail: string;
  size: string;
  price: number;
  image: string;
  imageAlt: string;
  accent: "sage" | "clay" | "ochre" | "forest";
}

export const products: readonly CoffeeProduct[] = [
  {
    id: "ethiopia-yirgacheffe",
    name: "Эфиопия Иргачеффе",
    origin: "ЭФИОПИЯ",
    notes: "Цветочный, бергамот",
    detail: "Светлая обжарка",
    size: "250 г",
    price: 32,
    image: "/images/ethiopia-v2.png",
    imageAlt: "Светлая пачка кофе Кварта — Эфиопия Иргачеффе",
    accent: "sage",
  },
  {
    id: "colombia-huila",
    name: "Колумбия Уила",
    origin: "КОЛУМБИЯ",
    notes: "Карамель, красное яблоко",
    detail: "Свежая обжарка",
    size: "250 г",
    price: 29,
    image: "/images/colombia-v2.png",
    imageAlt: "Светлая пачка кофе Кварта — Колумбия Уила",
    accent: "clay",
  },
  {
    id: "brazil-cerrado",
    name: "Бразилия Серрадо",
    origin: "БРАЗИЛИЯ",
    notes: "Орех, шоколад",
    detail: "Под эспрессо",
    size: "250 г",
    price: 26,
    image: "/images/brazil-v2.png",
    imageAlt: "Светлая пачка кофе Кварта — Бразилия Серрадо",
    accent: "ochre",
  },
  {
    id: "drip-assortment",
    name: "Дрипы, ассорти",
    origin: "ДРИП-ПАКЕТЫ",
    notes: "Кофе там, где вы",
    detail: "Нужны только чашка и вода",
    size: "10 штук",
    price: 18,
    image: "/images/drips.png",
    imageAlt: "Коробка и дрип-пакет кофе Кварта",
    accent: "forest",
  },
];

export function getProduct(id: ProductId | null) {
  return products.find((product) => product.id === id);
}

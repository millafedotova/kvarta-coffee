export const site = {
  name: "Кварта",
  address: "Минск, ул. Короля, 9",
  weekdayHours: "Пн–пт 8:00–20:00",
  weekendHours: "Сб–вс 10:00–18:00",
  subscription: { price: 54, count: 2, weight: 250 },
  navigation: [
    { href: "#coffee", label: "Наш кофе" },
    { href: "#subscription", label: "Подписка" },
    { href: "#roastery", label: "Мастерская" },
    { href: "#delivery", label: "Доставка" },
  ],
} as const;

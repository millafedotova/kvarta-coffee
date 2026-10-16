export const site = {
  subscription: { price: 54, count: 2, weight: 250 },
  batchWeightKg: 5,
  freeDeliveryFrom: 50,
  maxProductQuantity: 5,
  weekdayHours: "8:00–20:00",
  weekendHours: "10:00–18:00",
  copyrightYear: 2026,
  navigation: [
    { href: "#roastery", key: "roastery" },
    { href: "#coffee", key: "coffee" },
    { href: "#subscription", key: "subscription" },
    { href: "#delivery", key: "delivery" },
  ],
} as const;

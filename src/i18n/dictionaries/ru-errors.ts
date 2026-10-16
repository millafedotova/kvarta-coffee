import type { LeadErrorCode } from "@/lib/lead-errors";

export const ruErrors = {
  nameRequired: "Как к вам обращаться?",
  nameTooLong: "Введите имя не длиннее 100 символов.",
  nameInvalid: "Введите имя заново: в нём есть недопустимый символ.",
  phoneRequired: "Введите номер телефона.",
  phoneTooLong: "Проверьте номер телефона.",
  phoneInvalid: "Введите +375 и 9 цифр номера. Например: +375 29 123-45-67.",
  interestRequired: "Выберите, что вас интересует.",
  commentTooLong: "Сократите комментарий до 1000 символов.",
  commentInvalid: "Введите комментарий заново или оставьте поле пустым.",
  productSelectionInvalid: "Выберите кофе для разового заказа.",
  duplicateProducts: "Уберите повторяющиеся позиции.",
  productsInvalid: "Выберите кофе заново.",
  quantitiesInvalid: "Проверьте количество выбранного кофе.",
  fieldInvalid: "Проверьте значение в этом поле.",
} satisfies Record<LeadErrorCode, string>;

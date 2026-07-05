// The payment method learners in each country expect to use. Display only: the
// actual unlock is still by code or admin grant (no live processing in-app).
// Countries not listed fall back to card + Apple Pay / Google Pay.

const METHODS: Record<string, string> = {
  // Southern Africa
  Botswana: "Orange Money",
  Zimbabwe: "EcoCash",
  Zambia: "MTN MoMo or Airtel Money",
  Namibia: "card or mobile money",
  Lesotho: "M-Pesa or EcoCash",
  Eswatini: "MTN MoMo",
  Malawi: "Airtel Money or TNM Mpamba",
  Mozambique: "M-Pesa or e-Mola",
  Angola: "Multicaixa Express",
  // East Africa
  Kenya: "M-Pesa",
  Uganda: "MTN MoMo or Airtel Money",
  Tanzania: "M-Pesa or Mixx by Yas",
  Rwanda: "MTN MoMo",
  Ethiopia: "telebirr",
  // West & Central Africa
  Nigeria: "bank transfer or card",
  Ghana: "MTN MoMo",
  "Côte d'Ivoire": "Orange Money or MTN MoMo",
  Senegal: "Wave or Orange Money",
  Cameroon: "Orange Money or MTN MoMo",
  // North Africa
  Egypt: "card or Vodafone Cash",
  Morocco: "card",
  Tunisia: "card",
  Algeria: "card",
  // Other markets
  "South Africa": "card, Apple Pay or Google Pay",
  India: "UPI, card, Apple Pay or Google Pay",
};

const DEFAULT_METHOD = "card, Apple Pay or Google Pay";

export function paymentMethodFor(country?: string): string {
  return (country && METHODS[country]) || DEFAULT_METHOD;
}

// The payment method learners in each country expect to use. Display only: the
// actual unlock is still by code or admin grant (no live processing in-app).
// Countries not listed fall back to card + Apple Pay / Google Pay.

const METHODS: Record<string, string> = {
  // Southern Africa
  Botswana: "Orange Money",
  Zimbabwe: "EcoCash",
  Zambia: "MTN MoMo or Airtel Money",
  Namibia: "mobile money or a debit/credit card",
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
  Nigeria: "bank transfer or debit/credit card",
  Ghana: "MTN MoMo",
  "Côte d'Ivoire": "Orange Money or MTN MoMo",
  Senegal: "Wave or Orange Money",
  Cameroon: "Orange Money or MTN MoMo",
  // North Africa
  Egypt: "Vodafone Cash or a debit/credit card",
  Morocco: "debit or credit card",
  Tunisia: "debit or credit card",
  Algeria: "debit or credit card",
  // Other markets
  "South Africa": "debit/credit card, Apple Pay or Google Pay",
  India: "UPI, debit/credit card, Apple Pay or Google Pay",
};

const DEFAULT_METHOD = "debit/credit card, Apple Pay or Google Pay";

export function paymentMethodFor(country?: string): string {
  return (country && METHODS[country]) || DEFAULT_METHOD;
}

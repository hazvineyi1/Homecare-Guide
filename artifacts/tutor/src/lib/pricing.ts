// Localised display pricing. The price shown to a learner is expressed in the
// currency of the country they chose in onboarding. These are DISPLAY figures
// only, rounded local equivalents of a US$9/month, US$90/year base, with no
// live FX and no in-app settlement (unlock is via coupon or admin grant). To
// change pricing, edit the amounts here. Unlisted countries fall back to USD.

export interface Money {
  code: string;
  symbol: string;
  after?: boolean; // symbol printed after the amount (e.g. "600 MT")
  month: string;
  year: string;
}

const CUR: Record<string, Money> = {
  USD: { code: "USD", symbol: "$", month: "9", year: "90" },
  EUR: { code: "EUR", symbol: "€", month: "9", year: "90" },
  GBP: { code: "GBP", symbol: "£", month: "7", year: "70" },
  // Southern Africa
  BWP: { code: "BWP", symbol: "P", month: "120", year: "1,200" },
  ZAR: { code: "ZAR", symbol: "R", month: "170", year: "1,700" },
  ZMW: { code: "ZMW", symbol: "K", month: "240", year: "2,400" },
  NAD: { code: "NAD", symbol: "N$", month: "170", year: "1,700" },
  LSL: { code: "LSL", symbol: "L", month: "170", year: "1,700" },
  SZL: { code: "SZL", symbol: "E", month: "170", year: "1,700" },
  MWK: { code: "MWK", symbol: "MK", month: "16,000", year: "160,000" },
  MZN: { code: "MZN", symbol: "MT", after: true, month: "600", year: "6,000" },
  AOA: { code: "AOA", symbol: "Kz", month: "8,500", year: "85,000" },
  // East Africa
  KES: { code: "KES", symbol: "KSh", month: "1,200", year: "12,000" },
  UGX: { code: "UGX", symbol: "USh", month: "33,000", year: "330,000" },
  TZS: { code: "TZS", symbol: "TSh", month: "23,000", year: "230,000" },
  RWF: { code: "RWF", symbol: "FRw", month: "12,500", year: "125,000" },
  ETB: { code: "ETB", symbol: "Br", month: "1,100", year: "11,000" },
  // West & Central Africa
  NGN: { code: "NGN", symbol: "₦", month: "14,000", year: "140,000" },
  GHS: { code: "GHS", symbol: "₵", month: "130", year: "1,300" },
  XOF: { code: "XOF", symbol: "CFA", month: "5,500", year: "55,000" },
  XAF: { code: "XAF", symbol: "FCFA", month: "5,500", year: "55,000" },
  // North Africa
  EGP: { code: "EGP", symbol: "E£", month: "450", year: "4,500" },
  MAD: { code: "MAD", symbol: "DH", month: "90", year: "900" },
  DZD: { code: "DZD", symbol: "DA", month: "1,200", year: "12,000" },
  TND: { code: "TND", symbol: "DT", month: "28", year: "280" },
  // Other markets / diaspora
  INR: { code: "INR", symbol: "₹", month: "750", year: "7,500" },
  CAD: { code: "CAD", symbol: "C$", month: "12", year: "120" },
  AUD: { code: "AUD", symbol: "A$", month: "14", year: "140" },
  NZD: { code: "NZD", symbol: "NZ$", month: "15", year: "150" },
  AED: { code: "AED", symbol: "AED", after: true, month: "33", year: "330" },
  SAR: { code: "SAR", symbol: "SAR", after: true, month: "34", year: "340" },
};

const COUNTRY_CUR: Record<string, string> = {
  Botswana: "BWP", "South Africa": "ZAR", Zimbabwe: "USD", Zambia: "ZMW",
  Namibia: "NAD", Lesotho: "LSL", Eswatini: "SZL", Malawi: "MWK",
  Mozambique: "MZN", Angola: "AOA",
  Kenya: "KES", Uganda: "UGX", Tanzania: "TZS", Rwanda: "RWF", Ethiopia: "ETB",
  Nigeria: "NGN", Ghana: "GHS", Egypt: "EGP", Morocco: "MAD", Algeria: "DZD", Tunisia: "TND",
  "Côte d'Ivoire": "XOF", Senegal: "XOF", Benin: "XOF", Togo: "XOF",
  "Burkina Faso": "XOF", Mali: "XOF", Niger: "XOF",
  Cameroon: "XAF", Chad: "XAF", "Central African Republic": "XAF",
  "Republic of the Congo": "XAF", Gabon: "XAF",
  India: "INR", Canada: "CAD", Australia: "AUD", "New Zealand": "NZD",
  "United Arab Emirates": "AED", "Saudi Arabia": "SAR",
  "United Kingdom": "GBP", "United States": "USD",
  // Eurozone members that appear in the country list
  Ireland: "EUR", France: "EUR", Germany: "EUR", Spain: "EUR", Italy: "EUR",
  Netherlands: "EUR", Belgium: "EUR", Portugal: "EUR", Austria: "EUR",
  Greece: "EUR", Finland: "EUR", Luxembourg: "EUR", Malta: "EUR", Cyprus: "EUR",
  Slovakia: "EUR", Slovenia: "EUR", Croatia: "EUR", Lithuania: "EUR",
};

export function moneyFor(country?: string): Money {
  const code = country ? COUNTRY_CUR[country] : undefined;
  return (code && CUR[code]) || CUR.USD;
}

export function priceLabel(m: Money, which: "month" | "year"): string {
  const amt = which === "month" ? m.month : m.year;
  return m.after ? `${amt} ${m.symbol}` : `${m.symbol}${amt}`;
}

export function detectBrand(num: string): "visa"|"mastercard"|"amex"|"elo"|"unknown" {
  if (/^4/.test(num)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]))/.test(num)) return "mastercard";
  if (/^3[47]/.test(num)) return "amex";
  return "unknown";
}

export const BRAND = {
  visa: { label: "Visa", grad: "from-[#1A1F71] to-[#2A5ADA]", init: "VI" },
  mastercard: { label: "Mastercard", grad: "from-[#FF5F00] to-[#F79E1B]", init: "MC" },
  amex: { label: "Amex", grad: "from-[#2E77BC] to-[#55B3F3]", init: "AX" },
  elo: { label: "Elo", grad: "from-[#222] to-[#444]", init: "EL" },
  unknown: { label: "Cartão", grad: "from-blue-600 to-indigo-600", init: "CC" },
} as const;

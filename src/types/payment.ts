export type PaymentMethod = {
  id: string;
  brand: "visa" | "mastercard" | "amex" | "elo" | "unknown";
  last4: string;
  isDefault?: boolean;
  number: string;
  name: string;
  expiry: string;
  cvc: string;
};

export type Subscription = {
  id: string;
  name: string;
  status: "active" | "paused" | "canceled";
  paymentMethodId: string;
  planName: string;
  price: string;
  billing: string;
  // Novos campos para cupons
  priceAnnualCents?: number;
  firstChargeAmountCents?: number; // valor pago na primeira cobrança
  renewsAt?: string; // data da próxima renovação
};

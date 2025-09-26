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
};

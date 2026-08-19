// This file defines the SHAPE of a payment provider, without saying which
// one you're using. Every payment provider (Lemon Squeezy today, possibly
// something else later) will implement this same interface. The rest of
// the app — the checkout route, the webhook route — only ever talks to
// THIS interface, never to Lemon Squeezy's API directly.
//
// Why bother with this extra layer instead of just calling Lemon Squeezy's
// functions everywhere? If you ever needed to switch payment providers,
// you'd write one new file that implements this same interface, and
// nothing else in the app would need to change. See Section 0 of the
// roadmap for why this specific precaution is worth taking right now.

// What the checkout route needs to hand to a payment provider in order to
// start a purchase.
export interface CheckoutSessionInput {
  productId: string; // your own product's ID (from the `products` table)
  userId: string;    // the logged-in customer's Supabase user ID
  userEmail: string;
  redirectUrl?: string; // where to send the customer after successful payment
}

// What a payment provider hands back after starting a checkout.
export interface CheckoutSessionResult {
  checkoutUrl: string; // where to redirect the customer to pay
}

// A normalized, provider-agnostic shape for "something happened with a
// payment." Each real provider's webhook payload looks different — this is
// what we translate it INTO, so the webhook route's logic never has to
// know Lemon Squeezy's specific JSON shape.
export interface WebhookEvent {
  type: "order_created" | "order_refunded" | "unknown";
  externalOrderId: string;      // the payment provider's own order ID
  userId: string | null;        // pulled from checkout custom data
  productId: string | null;     // pulled from checkout custom data
  userEmail: string | null;     // pulled from checkout email data
  totalCents: number;
  currency: string;
}

// The interface itself. Anything that implements all three of these
// methods can be plugged in as "the" payment provider for this app.
export interface PaymentProvider {
  createCheckoutSession(
    input: CheckoutSessionInput
  ): Promise<CheckoutSessionResult>;

  // Confirms a webhook request genuinely came from the payment provider
  // and wasn't forged by someone else hitting your webhook URL directly.
  verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null
  ): boolean;

  // Turns the provider's raw webhook JSON into our normalized WebhookEvent
  // shape above.
  parseWebhookEvent(rawBody: string): WebhookEvent;
}
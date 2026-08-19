// The actual Lemon Squeezy implementation of the PaymentProvider interface
// from ./types.ts. This is the ONLY file in the app that knows anything
// about Lemon Squeezy's specific API shape.
//
// NOTE ON ENV VARS: none of these have real values yet, on purpose — you
// said you're finishing your Lemon Squeezy account registration later.
// That's fine. This file reads them from process.env at request time, not
// at build time, so the app will build and deploy successfully right now.
// It just won't be ABLE to actually process a payment until real values
// exist in your environment variables. Trying to buy something before then
// will fail with a clear error message (see below) instead of a confusing
// crash.

import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { readEnv } from "@/lib/env";
import type {
  PaymentProvider,
  CheckoutSessionInput,
  CheckoutSessionResult,
  WebhookEvent,
} from "./types";

const LEMON_SQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1/checkouts";

class LemonSqueezyProvider implements PaymentProvider {
  async createCheckoutSession(
    input: CheckoutSessionInput
  ): Promise<CheckoutSessionResult> {
    // TODO: insert the production Lemon Squeezy credentials once the merchant account is ready.
    const apiKey = readEnv("LEMONSQUEEZY_API_KEY");
    const storeId = readEnv("LEMONSQUEEZY_STORE_ID");

    if (!apiKey || !storeId) {
      throw new Error(
        "Lemon Squeezy isn't configured yet. Set LEMONSQUEEZY_API_KEY and " +
          "LEMONSQUEEZY_STORE_ID in your environment once your account is ready."
      );
    }

    // Every product you plan to sell needs a matching "variant" created in
    // your Lemon Squeezy store dashboard. We look up which variant belongs
    // to this product using the lemon_squeezy_variant_id column added to
    // your `products` table (see the migration alongside this file).
    const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase is not configured for checkout yet.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: product, error } = await supabase
      .from("products")
      .select("lemon_squeezy_variant_id")
      .eq("id", input.productId)
      .single();

    if (error || !product?.lemon_squeezy_variant_id) {
      throw new Error(
        `Product ${input.productId} isn't linked to a Lemon Squeezy variant yet. ` +
          "Create it in your Lemon Squeezy store, then set lemon_squeezy_variant_id " +
          "on this product's row."
      );
    }

    const response = await fetch(LEMON_SQUEEZY_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: input.userEmail,
              ...(input.redirectUrl ? { redirect_url: input.redirectUrl } : {}),
              // This "custom" object is the whole trick: Lemon Squeezy
              // stores it with the order and echoes it back, unchanged, in
              // the webhook event later. It's how we know WHO bought WHAT
              // without keeping any other state around in the meantime.
              custom: {
                user_id: input.userId,
                product_id: input.productId,
              },
            },
          },
          relationships: {
            store: {
              data: { type: "stores", id: storeId },
            },
            variant: {
              data: {
                type: "variants",
                id: product.lemon_squeezy_variant_id,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Lemon Squeezy checkout creation failed: ${errorBody}`);
    }

    const json = await response.json();
    return { checkoutUrl: json.data.attributes.url as string };
  }

  verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null
  ): boolean {
    // TODO: insert the production Lemon Squeezy webhook secret once the merchant account is ready.
    const secret = readEnv("LEMONSQUEEZY_WEBHOOK_SECRET");
    if (!secret || !signatureHeader) return false;

    // Recompute the signature ourselves, the same way Lemon Squeezy did,
    // using our shared secret — then compare. If someone forged this
    // request without knowing the secret, the signatures won't match.
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(signatureHeader, "utf8");

    // Lengths must match before timingSafeEqual — it throws if they don't,
    // rather than just returning false, so we check first.
    if (expected.length !== received.length) return false;

    // timingSafeEqual (not `===`) matters here: a plain string comparison
    // exits early on the first mismatched character, and a determined
    // attacker can measure those tiny timing differences to guess the
    // correct signature one character at a time. timingSafeEqual always
    // takes the same amount of time regardless of where a mismatch is.
    return crypto.timingSafeEqual(expected, received);
  }

  parseWebhookEvent(rawBody: string): WebhookEvent {
    let payload: unknown;

    const emptyEvent: WebhookEvent = {
      type: "unknown",
      externalOrderId: "",
      userId: null,
      productId: null,
      userEmail: null,
      totalCents: 0,
      currency: "usd",
    };

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return emptyEvent;
    }

    if (!payload || typeof payload !== "object") {
      return emptyEvent;
    }

    const eventPayload = payload as {
      meta?: {
        event_name?: unknown;
        custom_data?: { user_id?: unknown; product_id?: unknown };
      };
      data?: {
        id?: unknown;
        attributes?: {
          total?: unknown;
          currency?: unknown;
          user_email?: unknown;
          email?: unknown;
        };
      };
    };
    const eventName = eventPayload.meta?.event_name;
    const custom = eventPayload.meta?.custom_data ?? {};
    const attributes = eventPayload.data?.attributes ?? {};

    const type: WebhookEvent["type"] =
      eventName === "order_created"
        ? "order_created"
        : eventName === "order_refunded"
          ? "order_refunded"
          : "unknown";

    const rawEmail = attributes.user_email ?? attributes.email;

    return {
      type,
      externalOrderId: String(eventPayload.data?.id ?? ""),
      userId: typeof custom.user_id === "string" ? custom.user_id : null,
      productId: typeof custom.product_id === "string" ? custom.product_id : null,
      userEmail: typeof rawEmail === "string" && rawEmail ? rawEmail : null,
      totalCents: typeof attributes.total === "number" ? attributes.total : 0,
      currency:
        typeof attributes.currency === "string"
          ? attributes.currency.toLowerCase()
          : "usd",
    };
  }
}

// A single shared instance, imported by the checkout and webhook routes.
export const paymentProvider: PaymentProvider = new LemonSqueezyProvider();
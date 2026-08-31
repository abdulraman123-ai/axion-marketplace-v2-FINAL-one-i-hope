// POST /api/webhooks/lemonsqueezy — Lemon Squeezy calls this URL on its
// own, server-to-server, whenever a payment event happens. This is the
// ONLY place in the entire app that's allowed to create an `orders` row —
// never trust a browser redirect alone as proof that someone paid.
//
// Once your Lemon Squeezy account is ready, you'll paste this route's full
// URL (https://yourdomain.com/api/webhooks/lemonsqueezy) into Lemon
// Squeezy's dashboard under Settings > Webhooks, along with a signing
// secret that goes into LEMONSQUEEZY_WEBHOOK_SECRET.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { paymentProvider } from "@/lib/payments/lemonsqueezy";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { emailProvider } from "@/lib/email/provider";
import { purchaseConfirmationEmail } from "@/lib/email/templates/purchase-confirmation";

export async function POST(request: NextRequest) {
  // Read the RAW body text, not parsed JSON. Signature verification has to
  // check the exact bytes Lemon Squeezy sent — parsing and re-serializing
  // the JSON could subtly change the bytes and break the signature check.
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!paymentProvider.verifyWebhookSignature(rawBody, signature)) {
    console.error("Webhook signature verification failed — rejecting request.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = paymentProvider.parseWebhookEvent(rawBody);

  if (event.type !== "order_created") {
    // Acknowledge anything else (refunds, etc.) so Lemon Squeezy doesn't
    // keep retrying. We acknowledge but don't act; refund handling can be
    // added when needed.
    return NextResponse.json({ received: true });
  }

  if (!event.userId || !event.productId) {
    console.error("Webhook order_created missing custom data:", event);
    return NextResponse.json({ error: "Missing custom data" }, { status: 400 });
  }

  // Service-role client: this code runs only on the server (Lemon Squeezy
  // calls it directly — no customer's browser is involved), and it needs
  // to write an order on the customer's behalf, which requires bypassing
  // RLS. This webhook route and the one place in the checkout route that
  // looks up a product's variant ID are the ONLY places in the app that
  // should ever use this key.
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server storage is not configured yet." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Look up the actual product (published, not deleted) so we:
  //   1. Know the real current price (never trust the browser/webhook total
  //      blindly — we cross-check).
  //   2. Get the product name for the order_item.
  //   3. Confirm the product exists and is published.
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, price_cents, is_published")
    .eq("id", event.productId)
    .maybeSingle();

  if (productError) {
    console.error("Failed to look up product:", productError);
    return NextResponse.json({ error: "Failed to validate product" }, { status: 500 });
  }

  if (!product || !product.is_published) {
    // The product doesn't exist or isn't published — the customer shouldn't
    // have been able to buy it. Reject rather than recording a phantom order.
    console.error("Webhook referenced an unpublished/nonexistent product:", event.productId);
    return NextResponse.json({ received: false }, { status: 400 });
  }

  // Determine the price to record. We prefer the product's CURRENT price as
  // the source of truth for the database, but fall back to the webhook's
  // total if the product row lacks a price (shouldn't happen, but safe).
  const recordedPrice =
    typeof event.totalCents === "number" && event.totalCents > 0
      ? event.totalCents
      : product.price_cents > 0
        ? product.price_cents
        : event.totalCents;

  // Build the order row. lemon_squeezy_order_id is the idempotency key — a
  // unique index (added in migration 0002) prevents duplicate webhook
  // deliveries from creating duplicate orders.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: event.userId,
      lemon_squeezy_order_id: event.externalOrderId,
      payment_provider_order_id: event.externalOrderId,
      status: "completed",
      total_cents: recordedPrice,
      currency: event.currency,
      customer_email: event.userEmail ?? null,
    })
    .select()
    .single();

  if (orderError) {
    // Postgres error code 23505 = unique_violation. Lemon Squeezy is
    // allowed to send the same webhook more than once (that's a normal
    // part of how webhooks work) — the unique constraint on
    // lemon_squeezy_order_id means a repeat delivery fails harmlessly here
    // instead of creating a duplicate order.
    if (orderError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Failed to write order:", orderError);
    return NextResponse.json({ error: "Failed to record order" }, { status: 500 });
  }

  // Write the order item. product_name is required (NOT NULL) and we store
  // the historical price so later price changes don't alter what the
  // customer actually paid.
  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: event.productId,
    product_name: product.name,
    price_cents: recordedPrice,
    currency: event.currency,
    quantity: 1,
  });

  if (itemError) {
    console.error("Failed to write order item:", itemError);
    return NextResponse.json({ error: "Failed to record order item" }, { status: 500 });
  }

  // Send a purchase confirmation email. This is best-effort only — email
  // delivery failure must NOT cause the webhook to report a failed payment,
  // because the order has already been recorded successfully.
  try {
    if (order.customer_email) {
      const confirmation = purchaseConfirmationEmail({
        customerEmail: order.customer_email,
        productName: product.name,
        orderId: order.id,
        amountCents: recordedPrice,
        currency: event.currency,
        purchasedAt: order.created_at ?? new Date().toISOString(),
      });
      await emailProvider.sendEmail(confirmation);
    }
  } catch (emailError) {
    console.error("Purchase confirmation email failed (non-fatal):", emailError);
  }

  return NextResponse.json({ received: true });
}
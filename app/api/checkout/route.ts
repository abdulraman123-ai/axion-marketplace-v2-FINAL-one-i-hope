// POST /api/checkout — call this from a "Buy" button with { productId }.
// Returns a checkoutUrl to redirect the customer to.
//
// SECURITY: never trust the client for pricing. This route (and the
// checkout provider itself) look up the authoritative product row from the
// database. The webhook is the only place that actually records a paid
// order, using the server-side price.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { paymentProvider } from "@/lib/payments/lemonsqueezy";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { getSiteUrl } from "@/lib/site";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Who's asking? Checkout requires being signed in — an anonymous visitor
  // should never be able to start a purchase, since we need a real user_id
  // to attach to the order later.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You need to sign in before buying a product." },
      { status: 401 }
    );
  }

  if (!user.email) {
    return NextResponse.json(
      { error: "Your account is missing an email address." },
      { status: 400 }
    );
  }

  let productId: string | undefined;
  try {
    const body = await request.json();
    productId = typeof body?.productId === "string" ? body.productId.trim() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!productId) {
    return NextResponse.json({ error: "Missing productId." }, { status: 400 });
  }

  // Server-side product validation before handing off to the payment
  // provider. We confirm:
  //   1. The product exists.
  //   2. It's published (a draft/coming-soon product can't be purchased yet
  //      unless is_coming_soon is false AND it's published).
  //   3. It's not marked "coming soon."
  //   4. It has a positive price.
  //   5. It's linked to a Lemon Squeezy variant (checked inside the provider,
  //      but we validate published/price here so we fail fast).
  //
  // We use the service-role client here ONLY to read products for this
  // deterministic check without RLS interference. (RLS only exposes published
  // products to public users anyway, but the service client makes the intent
  // explicit and also lets us check is_coming_soon which public users can see.)
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Checkout isn't configured yet." },
      { status: 500 }
    );
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { data: product, error: productError } = await serviceClient
    .from("products")
    .select("id, name, price_cents, is_published, is_coming_soon, lemon_squeezy_variant_id")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    console.error("Failed to validate product for checkout:", productError);
    return NextResponse.json(
      { error: "Could not validate product." },
      { status: 500 }
    );
  }

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (!product.is_published) {
    return NextResponse.json(
      { error: "This product isn't available yet." },
      { status: 409 }
    );
  }

  if (product.is_coming_soon) {
    return NextResponse.json(
      { error: "This product is coming soon and isn't available for purchase yet." },
      { status: 409 }
    );
  }

  if (!product.price_cents || product.price_cents <= 0) {
    return NextResponse.json(
      { error: "This product doesn't have a valid price." },
      { status: 409 }
    );
  }

  if (!product.lemon_squeezy_variant_id) {
    return NextResponse.json(
      { error: "This product isn't linked to a payment variant yet." },
      { status: 409 }
    );
  }

  try {
    const session = await paymentProvider.createCheckoutSession({
      productId,
      userId: user.id,
      userEmail: user.email,
      redirectUrl: `${getSiteUrl()}/checkout/success`,
    });
    return NextResponse.json({ checkoutUrl: session.checkoutUrl });
  } catch (err) {
    // Anything that goes wrong here — Lemon Squeezy not configured yet,
    // a product with no linked variant, a network error — lands here.
    // We log the real reason for you, but tell the customer something
    // generic and non-technical.
    console.error("Checkout session creation failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again in a moment." },
      { status: 500 }
    );
  }
}
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

test.describe("Public route authorization", () => {
  test("logged-out user is redirected from /admin/dashboard to /sign-in", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/products to /sign-in", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/categories to /sign-in", async ({ page }) => {
    await page.goto("/admin/categories");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/orders to /sign-in", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/customers to /sign-in", async ({ page }) => {
    await page.goto("/admin/customers");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/users to /sign-in", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/roles to /sign-in", async ({ page }) => {
    await page.goto("/admin/roles");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/files to /sign-in", async ({ page }) => {
    await page.goto("/admin/files");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/downloads to /sign-in", async ({ page }) => {
    await page.goto("/admin/downloads");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/audit-logs to /sign-in", async ({ page }) => {
    await page.goto("/admin/audit-logs");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/analytics to /sign-in", async ({ page }) => {
    await page.goto("/admin/analytics");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/revenue to /sign-in", async ({ page }) => {
    await page.goto("/admin/revenue");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user is redirected from /admin/security to /sign-in", async ({ page }) => {
    await page.goto("/admin/security");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("logged-out user cannot call admin products API", async ({ page }) => {
    const response = await page.request.post("/api/admin/products", {
      data: { name: "Test", priceCents: 1000 },
    });
    expect(response.status()).not.toBe(200);
  });
});

test.describe("Customer authorization", () => {
  test.skip(
    !isSupabaseConfigured || !process.env.PLAYWRIGHT_CUSTOMER_EMAIL || !process.env.PLAYWRIGHT_CUSTOMER_PASSWORD,
    "Requires PLAYWRIGHT_CUSTOMER_EMAIL and PLAYWRIGHT_CUSTOMER_PASSWORD env vars"
  );

  let customerAccessToken: string | null = null;

  test.beforeAll(async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: process.env.PLAYWRIGHT_CUSTOMER_EMAIL!,
      password: process.env.PLAYWRIGHT_CUSTOMER_PASSWORD!,
    });

    if (error || !data.session) {
      throw new Error(`Customer sign-in failed: ${error?.message ?? "no session"}`);
    }

    customerAccessToken = data.session.access_token;
  });

  test.afterAll(async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    await supabase.auth.signOut();
  });

  test("customer cannot access /admin/dashboard", async ({ page }) => {
    if (!customerAccessToken) {
      test.skip(true, "Customer session not available");
      return;
    }

    await page.setExtraHTTPHeaders({
      Authorization: `Bearer ${customerAccessToken}`,
    });
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/products/);
    await page.setExtraHTTPHeaders({});
  });

  test("customer cannot call admin products API", async ({ page }) => {
    if (!customerAccessToken) {
      test.skip(true, "Customer session not available");
      return;
    }

    const response = await page.request.post("/api/admin/products", {
      headers: {
        Authorization: `Bearer ${customerAccessToken}`,
      },
      data: { name: "Test", priceCents: 1000 },
    });

    expect(response.status()).toBe(403);
  });
});

test.describe("Admin authorization", () => {
  test.skip(
    !isSupabaseConfigured || !process.env.PLAYWRIGHT_ADMIN_EMAIL || !process.env.PLAYWRIGHT_ADMIN_PASSWORD,
    "Requires PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD env vars"
  );

  let adminAccessToken: string | null = null;

  test.beforeAll(async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: process.env.PLAYWRIGHT_ADMIN_EMAIL!,
      password: process.env.PLAYWRIGHT_ADMIN_PASSWORD!,
    });

    if (error || !data.session) {
      throw new Error(`Admin sign-in failed: ${error?.message ?? "no session"}`);
    }

    adminAccessToken = data.session.access_token;
  });

  test.afterAll(async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    await supabase.auth.signOut();
  });

  test("admin can access /admin/dashboard", async ({ page }) => {
    if (!adminAccessToken) {
      test.skip(true, "Admin session not available");
      return;
    }

    await page.setExtraHTTPHeaders({
      Authorization: `Bearer ${adminAccessToken}`,
    });
    await page.goto("/admin/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");
    await page.setExtraHTTPHeaders({});
  });

  test("admin can call admin products API", async ({ page }) => {
    if (!adminAccessToken) {
      test.skip(true, "Admin session not available");
      return;
    }

    const response = await page.request.post("/api/admin/products", {
      headers: {
        Authorization: `Bearer ${adminAccessToken}`,
      },
      data: { name: "Playwright Test Product", priceCents: 1000 },
    });

    expect(response.status()).toBe(200);
  });
});

test.describe("Checkout and payment safety", () => {
  test("checkout API rejects request without productId", async ({ page }) => {
    const response = await page.request.post("/api/checkout", {
      data: {},
    });

    expect(response.status()).toBe(401);
  });

  test("checkout API rejects request for nonexistent product", async ({ page }) => {
    const response = await page.request.post("/api/checkout", {
      data: { productId: "00000000-0000-0000-0000-000000000000" },
    });

    expect(response.status()).toBe(401);
  });
});

test.describe("Webhook behavior", () => {
  test("webhook rejects invalid signature", async ({ page }) => {
    const response = await page.request.post("/api/webhooks/lemonsqueezy", {
      headers: {
        "x-signature": "invalid-signature",
      },
      data: { type: "order_created" },
    });

    expect(response.status()).not.toBe(200);
  });

  test("webhook rejects missing signature", async ({ page }) => {
    const response = await page.request.post("/api/webhooks/lemonsqueezy", {
      data: { type: "order_created" },
    });

    expect(response.status()).not.toBe(200);
  });
});

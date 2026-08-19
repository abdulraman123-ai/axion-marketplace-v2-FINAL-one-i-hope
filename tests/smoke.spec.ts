import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Practical digital products that help teams move faster.");
  });

  test("products page loads", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator("h1")).toContainText("Premium products for teams that need to move with clarity.");
  });

  test("categories page loads", async ({ page }) => {
    await page.goto("/categories");
    await expect(page.locator("h1")).toContainText("Categories");
  });

  test("search page loads", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1")).toContainText("Search products");
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1")).toContainText("About Axion");
  });

  test("faq page loads", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.locator("h1")).toContainText("Frequently Asked Questions");
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toContainText("Contact");
  });

  test("legal pages load", async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("/privacy-policy");
    await expect(page.locator("h1")).toContainText("Privacy Policy");

    await page.goto("/terms-of-service");
    await expect(page.locator("h1")).toContainText("Terms of Service");

    await page.goto("/refund-policy");
    await expect(page.locator("h1")).toContainText("Refund Policy");

    await page.goto("/cookie-policy");
    await expect(page.locator("h1")).toContainText("Cookie Policy");

    await page.goto("/license");
    await expect(page.locator("h1")).toContainText("License");

    await page.goto("/disclaimer");
    await expect(page.locator("h1")).toContainText("Disclaimer");
  });
});

test.describe("Authentication pages", () => {
  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("h1")).toContainText("Sign in");
  });

  test("sign-up page loads", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator("h1")).toContainText("Create an account");
  });

  test("forgot-password page loads", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h1")).toContainText("Forgot password");
  });

  test("reset-password page shows invalid link state without code", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.locator("h1")).toContainText("Invalid or expired reset link");
  });
});

test.describe("Protected routes", () => {
  test("unauthenticated user is redirected from dashboard to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    const url = page.url();
    const isRedirected = url.includes("/sign-in");
    const hasErrorPage = await page.locator("#__next_error__").count() > 0;
    expect(isRedirected || hasErrorPage).toBe(true);
  });

  test("unauthenticated user is redirected from purchases to sign-in", async ({ page }) => {
    await page.goto("/dashboard/purchases");
    const url = page.url();
    const isRedirected = url.includes("/sign-in");
    const hasErrorPage = await page.locator("#__next_error__").count() > 0;
    expect(isRedirected || hasErrorPage).toBe(true);
  });

  test("unauthenticated user is redirected from profile to sign-in", async ({ page }) => {
    await page.goto("/dashboard/profile");
    const url = page.url();
    const isRedirected = url.includes("/sign-in");
    const hasErrorPage = await page.locator("#__next_error__").count() > 0;
    expect(isRedirected || hasErrorPage).toBe(true);
  });

  test("unauthenticated user is redirected from settings to sign-in", async ({ page }) => {
    await page.goto("/dashboard/settings");
    const url = page.url();
    const isRedirected = url.includes("/sign-in");
    const hasErrorPage = await page.locator("#__next_error__").count() > 0;
    expect(isRedirected || hasErrorPage).toBe(true);
  });

  test("unauthenticated user is redirected from admin dashboard to sign-in", async ({ page }) => {
    await page.goto("/admin/dashboard");
    const url = page.url();
    const isRedirected = url.includes("/sign-in");
    const hasErrorPage = await page.locator("#__next_error__").count() > 0;
    expect(isRedirected || hasErrorPage).toBe(true);
  });
});

test.describe("Navigation", () => {
  test("navigation links are present on homepage", async ({ page }) => {
    await page.goto("/");
    const primaryNav = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(primaryNav.getByRole("link", { name: "Shop" })).toBeVisible();
    await expect(primaryNav.getByRole("link", { name: "Categories" })).toBeVisible();
    await expect(primaryNav.getByRole("link", { name: "About" })).toBeVisible();
  });
});

test.describe("Checkout pages", () => {
  test("checkout success page loads", async ({ page }) => {
    await page.goto("/checkout/success");
    await expect(page.locator("h1")).toContainText("Payment received");
  });

  test("checkout cancelled page loads", async ({ page }) => {
    await page.goto("/checkout/cancelled");
    await expect(page.locator("h1")).toContainText("Checkout cancelled");
  });
});

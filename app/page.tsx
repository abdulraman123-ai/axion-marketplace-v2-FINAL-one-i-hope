import { CatalogCta } from "@/components/landing/catalog-cta";
import { CraftSection } from "@/components/landing/craft-section";
import { FeaturedProducts } from "@/components/landing/featured-products";
import { HomeHero } from "@/components/landing/home-hero";
import { ProductCategories } from "@/components/landing/product-categories";
import { SiteNav } from "@/components/site-nav";

export default function HomePage() {
  return (
    <main id="content" className="flex flex-1 flex-col overflow-hidden">
      <SiteNav />
      <HomeHero />
      <FeaturedProducts />
      <ProductCategories />
      <CraftSection />
      <CatalogCta />
        <footer className="border-t border-border/80 px-6 py-10 text-center text-sm text-text-secondary sm:px-12">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>AXION builds and maintains premium digital products for modern teams.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
              <a href="/products" className="transition-colors hover:text-text-primary">
                Products
              </a>
              <a href="/categories" className="transition-colors hover:text-text-primary">
                Categories
              </a>
              <a href="/about" className="transition-colors hover:text-text-primary">
                About
              </a>
              <a href="/contact" className="transition-colors hover:text-text-primary">
                Contact
              </a>
              <a href="/privacy-policy" className="transition-colors hover:text-text-primary">
                Privacy
              </a>
              <a href="/terms-of-service" className="transition-colors hover:text-text-primary">
                Terms
              </a>
            </div>
          </div>
        </footer>
    </main>
  );
}

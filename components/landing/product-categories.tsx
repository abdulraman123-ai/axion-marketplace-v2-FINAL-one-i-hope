import {
  Blocks,
  BookOpen,
  Bot,
  Code2,
  FileText,
  GraduationCap,
  LayoutTemplate,
  NotebookTabs,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export async function ProductCategories() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  const categoryList = (categories ?? []) as Category[];

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "Business Operating Systems": Blocks,
    "AI Systems": Bot,
    Templates: LayoutTemplate,
    "Notion Workspaces": NotebookTabs,
    "Source Code": Code2,
    "UI Kits": Sparkles,
    Courses: GraduationCap,
    "E-books": BookOpen,
    "Productivity Assets": FileText,
    "Automation Systems": Workflow,
  };

  return (
    <section className="border-b border-border/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_32%),rgba(17,17,17,0.45)] px-6 py-24 sm:px-12 lg:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-success">
            Built to expand
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-text-primary sm:text-4xl">
            A catalog architecture for many premium products.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
            AXION can grow across product types without becoming a generic
            inventory hub. The unifying thread is product quality and business
            utility.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {categoryList.map((category) => {
            const Icon = iconMap[category.name] ?? LayoutTemplate;

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-surface/80"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                  <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

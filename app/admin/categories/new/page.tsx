import { ConsoleShell } from "@/components/admin/console-shell";
import { ConsoleCard } from "@/components/admin/console-card";
import { CategoryForm } from "@/components/admin/category-form";

export default function AdminNewCategoryPage() {
  return (
    <ConsoleShell>
      <ConsoleCard title="Create category">
        <CategoryForm />
      </ConsoleCard>
    </ConsoleShell>
  );
}

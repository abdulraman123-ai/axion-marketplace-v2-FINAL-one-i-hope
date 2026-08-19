import { createClient } from "@/lib/supabase/server";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";

interface OrderWithItems {
  id: string;
  created_at: string;
  status: string;
  total_cents: number;
  currency: string;
  customer_email: string | null;
  order_items: {
    product_name: string;
    price_cents: number;
  }[];
}

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(
      `id, created_at, status, total_cents, currency, customer_email,
       order_items ( product_name, price_cents )`
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const orders = (data ?? []) as unknown as OrderWithItems[];

  return (
    <FounderConsolePage>
      <div className="space-y-6">
        <ConsoleCard
          title="Orders"
          eyebrow="Commerce"
          action={
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-text-secondary">
              {orders.length} order{orders.length === 1 ? "" : "s"}
            </span>
          }
        >
          {orders.length === 0 ? (
            <div className="rounded-xl border border-border/70 bg-surface/50 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-text-primary">
                No orders yet
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Orders will appear here once customers complete a purchase.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-xs uppercase tracking-[0.2em] text-text-secondary">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    <th className="pb-3 pr-4 font-medium">Product</th>
                    <th className="pb-3 pr-4 text-right font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 pr-4 text-text-secondary">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4 text-text-primary">
                        {order.customer_email ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-text-primary">
                        {order.order_items[0]?.product_name ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-right text-text-primary">
                        {order.currency?.toUpperCase()}{" "}
                        {(order.total_cents / 100).toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span
                          className={
                            order.status === "completed" || order.status === "paid"
                              ? "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400"
                              : order.status === "refunded"
                                ? "rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400"
                                : "rounded-full bg-surface-elevated px-3 py-1 text-xs font-semibold text-text-secondary"
                          }
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ConsoleCard>
      </div>
    </FounderConsolePage>
  );
}
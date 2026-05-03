"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthUserSerialized } from "@/lib/supabase-auth-user";
import {
  DashboardPrimaryButton,
  DashboardSectionTitle,
  DashboardShell,
  DashboardStat,
} from "@/components/dashboard/page-shell";
import { useLoadSampleDataMutation } from "@/lib/queries/sample-data";

const modules = [
  {
    title: "Ingredients",
    description: "Stock, cost per unit, par levels, and archive state.",
    href: "/dashboard/ingredients",
  },
  {
    title: "Batches",
    description: "Production runs, expected vs actual yield, closing runs.",
    href: "/dashboard/ingredients/batches",
  },
  {
    title: "Recipes",
    description: "Ingredient lines and theoretical costing.",
    href: "/dashboard/recipes",
  },
  {
    title: "Menus",
    description: "Menu sets and item-level margin snapshots.",
    href: "/dashboard/menus",
  },
  {
    title: "Waste log",
    description: "Quantity, date, and reason for kitchen waste.",
    href: "/dashboard/waste-log",
  },
];

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const sampleMutation = useLoadSampleDataMutation();
  const [sampleMessage, setSampleMessage] = useState<string | null>(null);
  const [sampleError, setSampleError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const user = await getAuthUserSerialized();
      setUserId(user?.id ?? null);
    }
    loadUser();
  }, []);

  return (
    <DashboardShell
      title="Overview"
      description="Cloud kitchen operations — jump into a module or use the sidebar."
      meta={<DashboardStat label="Modules" value={String(modules.length)} />}
    >
      <div className="space-y-10">
        <div className="divide-y divide-zinc-200 bg-white">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group flex items-start justify-between gap-6 px-5 py-5 transition-colors hover:bg-zinc-50/80 md:items-center"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-[15px] font-medium text-zinc-900">{module.title}</p>
                <p className="text-sm leading-relaxed text-zinc-600">{module.description}</p>
              </div>
              <span className="shrink-0 pt-0.5 text-sm font-medium text-zinc-400 transition-colors group-hover:text-zinc-900">
                Open
              </span>
            </Link>
          ))}
        </div>

        <section className="border-t border-zinc-200 pt-10">
          <DashboardSectionTitle>Sample testing data</DashboardSectionTitle>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Inserts realistic cloud-kitchen ingredients, production recipes,{" "}
            <strong className="font-medium text-zinc-800">20 aggregator-style menus</strong> with
            priced lines, and{" "}
            <strong className="font-medium text-zinc-800">30 days of waste history</strong> (several
            entries per calendar day, mixed reasons). Existing rows are not removed—each run adds
            another full set.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <DashboardPrimaryButton
              type="button"
              disabled={!userId || sampleMutation.isPending}
              onClick={async () => {
                if (!userId) {
                  return;
                }
                setSampleMessage(null);
                setSampleError(null);
                try {
                  const r = await sampleMutation.mutateAsync(userId);
                  setSampleMessage(
                    `Added ${r.ingredientsInserted} ingredients, ${r.recipesInserted} recipes, ${r.menusInserted} menus (${r.menuItemsInserted} priced lines), ${r.wasteLogsInserted} waste entries.`,
                  );
                } catch (e) {
                  setSampleError(e instanceof Error ? e.message : "Request failed.");
                }
              }}
            >
              {sampleMutation.isPending ? "Loading…" : "Load sample data"}
            </DashboardPrimaryButton>
          </div>
          {sampleError ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {sampleError}
            </p>
          ) : null}
          {sampleMessage ? <p className="mt-3 text-sm text-zinc-700">{sampleMessage}</p> : null}
        </section>
      </div>
    </DashboardShell>
  );
}

"use client";

import Link from "next/link";
import { DashboardShell, DashboardStat } from "@/components/dashboard/page-shell";

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
  return (
    <DashboardShell
      title="Overview"
      description="Cloud kitchen operations — jump into a module or use the sidebar."
      meta={<DashboardStat label="Modules" value={String(modules.length)} />}
    >
      <div className="grid gap-0 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
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
    </DashboardShell>
  );
}

"use client";

import Link from "next/link";

const modules = [
  {
    title: "Ingredients",
    description: "Track stock, cost per unit, par levels, and archive state.",
    href: "/dashboard/ingredients",
  },
  {
    title: "Batches",
    description: "Start production, compare expected vs actual, and close runs.",
    href: "/dashboard/ingredients/batches",
  },
  {
    title: "Recipes",
    description: "Build recipes with ingredient lines and costing.",
    href: "/dashboard/recipes",
  },
  {
    title: "Menus",
    description: "Create menu sets and view item-level margin snapshots.",
    href: "/dashboard/menus",
  },
  {
    title: "Waste Log",
    description: "Capture wastage with quantity, date, and reason tracking.",
    href: "/dashboard/waste-log",
  },
];

export default function DashboardPage() {
  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-white/50 bg-white/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_34px_rgba(0,0,0,0.09)] supports-[backdrop-filter]:bg-white/72 supports-[backdrop-filter]:backdrop-blur-lg md:p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
          Manage your cloud kitchen operations from the modules below.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 transition-colors hover:bg-zinc-50"
            >
              <p className="text-sm font-semibold text-black">{module.title}</p>
              <p className="mt-1 text-xs text-zinc-600">{module.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

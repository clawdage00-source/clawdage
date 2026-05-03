"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import {
  useCreateIngredientMutation,
  useIngredientsQuery,
  useUpdateIngredientMutation,
} from "@/lib/queries/ingredients";

export default function IngredientsPage() {
  const unitOptions = ["kg", "g", "l", "ml", "pcs", "pack", "tray"];
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [parLevel, setParLevel] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [stockDraftById, setStockDraftById] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    }
    loadUser();
  }, []);

  const ingredientsQuery = useIngredientsQuery(userId, search, lowStockOnly);
  const createIngredient = useCreateIngredientMutation();
  const updateIngredient = useUpdateIngredientMutation();

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setErrorMessage("Please login again.");
      return;
    }
    setErrorMessage(null);
    try {
      await createIngredient.mutateAsync({
        userId,
        name,
        unit,
        parLevel: parLevel ? Number(parLevel) : undefined,
        costPerUnit: costPerUnit ? Number(costPerUnit) : undefined,
      });
      setName("");
      setUnit("kg");
      setParLevel("");
      setCostPerUnit("");
    } catch {
      setErrorMessage("Could not create ingredient.");
    }
  }

  const ingredients = ingredientsQuery.data?.items ?? [];

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-white/50 bg-white/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_34px_rgba(0,0,0,0.09)] supports-[backdrop-filter]:bg-white/72 supports-[backdrop-filter]:backdrop-blur-lg md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Ingredients</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Manage stock, cost, par levels, and archive status.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Total Ingredients</p>
            <p className="text-lg font-semibold">{ingredients.length}</p>
          </div>
        </div>

      <form onSubmit={handleCreate} className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-5">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ingredient name" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        >
          {unitOptions.map((option) => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
        </select>
        <input value={parLevel} onChange={(e) => setParLevel(e.target.value)} placeholder="Par level" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} placeholder="Cost/unit" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <button type="submit" disabled={createIngredient.isPending} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {createIngredient.isPending ? "Saving..." : "Add ingredient"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" className="w-72 rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          Low stock only
        </label>
      </div>

      {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}

      {ingredientsQuery.isLoading ? <p className="mt-4 text-sm text-zinc-600">Loading ingredients...</p> : null}
      {ingredientsQuery.isError ? <p className="mt-4 text-sm text-red-600">Failed to load ingredients.</p> : null}

      {!ingredientsQuery.isLoading && !ingredientsQuery.isError && (ingredientsQuery.data?.items.length ?? 0) === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">No ingredients found. Create your first ingredient.</p>
      ) : null}

      <ul className="mt-4 space-y-2">
        {ingredientsQuery.data?.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-zinc-600">
                {item.currentStock} {item.unit} | par {item.parLevel ?? "-"} | cost {item.costPerUnit ?? "-"}
              </p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <input
                value={stockDraftById[item.id] ?? String(item.currentStock)}
                onChange={(e) =>
                  setStockDraftById((prev) => ({
                    ...prev,
                    [item.id]: e.target.value,
                  }))
                }
                placeholder="Stock"
                className="w-24 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (!userId) {
                    return;
                  }
                  const nextStock = stockDraftById[item.id];
                  if (nextStock === undefined || nextStock === "") {
                    return;
                  }
                  updateIngredient.mutate({
                    ingredientId: item.id,
                    payload: { userId, currentStock: Number(nextStock) },
                  });
                }}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs"
              >
                Update stock
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!userId) {
                    return;
                  }
                  updateIngredient.mutate({
                    ingredientId: item.id,
                    payload: { userId, isArchived: !item.isArchived },
                  });
                }}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs"
              >
                {item.isArchived ? "Unarchive" : "Archive"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </main>
  );
}

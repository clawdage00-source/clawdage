"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useBatchesQuery, useCloseBatchMutation, useCreateBatchMutation } from "@/lib/queries/batches";
import { useRecipesQuery } from "@/lib/queries/recipes";

export default function BatchesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [recipeId, setRecipeId] = useState("");
  const [expectedYield, setExpectedYield] = useState("");
  const [actualYield, setActualYield] = useState("");
  const [waste, setWaste] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    }
    loadUser();
  }, []);

  const recipesQuery = useRecipesQuery(userId);
  const batchesQuery = useBatchesQuery(userId);
  const createBatch = useCreateBatchMutation();
  const closeBatch = useCloseBatchMutation();

  async function handleCreateBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !recipeId) {
      setErrorMessage("Select a recipe and login again.");
      return;
    }
    setErrorMessage(null);
    try {
      await createBatch.mutateAsync({
        userId,
        recipeId,
        expectedYield: expectedYield ? Number(expectedYield) : undefined,
      });
      setExpectedYield("");
    } catch {
      setErrorMessage("Could not create batch.");
    }
  }

  async function handleCloseBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !selectedBatchId) {
      setErrorMessage("Select a batch to close.");
      return;
    }
    setErrorMessage(null);
    try {
      await closeBatch.mutateAsync({
        batchId: selectedBatchId,
        payload: {
          userId,
          actualYield: actualYield ? Number(actualYield) : undefined,
          wasteQuantity: waste ? Number(waste) : undefined,
          status: "completed",
        },
      });
      setActualYield("");
      setWaste("");
    } catch {
      setErrorMessage("Could not close batch.");
    }
  }

  const batches = batchesQuery.data?.items ?? [];
  const inProgressCount = batches.filter((batch) => String(batch.status) === "in_progress").length;

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-white/50 bg-white/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_34px_rgba(0,0,0,0.09)] supports-[backdrop-filter]:bg-white/72 supports-[backdrop-filter]:backdrop-blur-lg md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Batches</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Plan production runs and compare expected vs actual yield.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-zinc-500">In Progress</p>
            <p className="text-lg font-semibold">{inProgressCount}</p>
          </div>
        </div>

      <form onSubmit={handleCreateBatch} className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-4">
        <select value={recipeId} onChange={(e) => setRecipeId(e.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          <option value="">Select recipe</option>
          {recipesQuery.data?.items.map((recipe) => (
            <option key={String(recipe.id)} value={String(recipe.id)}>
              {String(recipe.name)}
            </option>
          ))}
        </select>
        <input value={expectedYield} onChange={(e) => setExpectedYield(e.target.value)} placeholder="Expected yield" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
          {createBatch.isPending ? "Creating..." : "Start batch"}
        </button>
      </form>

      <form onSubmit={handleCloseBatch} className="mt-4 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-5">
        <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          <option value="">Select in-progress batch</option>
          {batchesQuery.data?.items
            .filter((batch) => String(batch.status) === "in_progress")
            .map((batch) => (
              <option key={String(batch.id)} value={String(batch.id)}>
                {String(batch.recipeName)} ({String(batch.id).slice(0, 8)})
              </option>
            ))}
        </select>
        <input value={actualYield} onChange={(e) => setActualYield(e.target.value)} placeholder="Actual yield" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input value={waste} onChange={(e) => setWaste(e.target.value)} placeholder="Waste qty" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          {closeBatch.isPending ? "Closing..." : "Close batch"}
        </button>
      </form>

      {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
      {batchesQuery.isLoading ? <p className="mt-4 text-sm text-zinc-600">Loading batches...</p> : null}
      {batchesQuery.isError ? <p className="mt-4 text-sm text-red-600">Failed to load batches.</p> : null}
      {!batchesQuery.isLoading && !batchesQuery.isError && (batchesQuery.data?.items.length ?? 0) === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">No batches yet. Start your first batch above.</p>
      ) : null}

      <ul className="mt-4 space-y-2">
        {batchesQuery.data?.items.map((batch) => (
          <li key={String(batch.id)} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <p className="text-sm font-semibold">{String(batch.recipeName)}</p>
            <p className="mt-1 text-xs text-zinc-600">
              status {String(batch.status)} | expected {String(batch.expectedYield)} | actual {String(batch.actualYield ?? "-")} | waste {String(batch.wasteQuantity)}
            </p>
          </li>
        ))}
      </ul>
      </div>
    </main>
  );
}

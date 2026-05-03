"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useIngredientsQuery } from "@/lib/queries/ingredients";
import { useCreateWasteLogMutation, useWasteLogsQuery } from "@/lib/queries/waste-logs";

export default function WasteLogPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ingredientId, setIngredientId] = useState("");
  const [quantityWasted, setQuantityWasted] = useState("");
  const [reason, setReason] = useState("");
  const [wasteDate, setWasteDate] = useState(new Date().toISOString().slice(0, 10));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    }
    loadUser();
  }, []);

  const ingredientsQuery = useIngredientsQuery(userId, "", false);
  const wasteLogsQuery = useWasteLogsQuery(userId);
  const createWasteLog = useCreateWasteLogMutation();

  const totalWasted = useMemo(
    () =>
      (wasteLogsQuery.data?.items ?? []).reduce(
        (sum, row) => sum + Number(row.quantityWasted ?? 0),
        0,
      ),
    [wasteLogsQuery.data?.items],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setErrorMessage("Please login again.");
      return;
    }
    setErrorMessage(null);
    try {
      await createWasteLog.mutateAsync({
        userId,
        ingredientId,
        quantityWasted: Number(quantityWasted),
        reason,
        wasteDate,
      });
      setIngredientId("");
      setQuantityWasted("");
      setReason("");
      setWasteDate(new Date().toISOString().slice(0, 10));
    } catch {
      setErrorMessage("Could not save waste log.");
    }
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-white/50 bg-white/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_34px_rgba(0,0,0,0.09)] supports-[backdrop-filter]:bg-white/72 supports-[backdrop-filter]:backdrop-blur-lg md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Waste Log</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Capture kitchen waste with ingredient, quantity, and reason.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Total Wasted</p>
            <p className="text-lg font-semibold">{totalWasted.toFixed(2)}</p>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-5"
        >
          <select
            required
            value={ingredientId}
            onChange={(event) => setIngredientId(event.target.value)}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="">Select ingredient</option>
            {ingredientsQuery.data?.items.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </option>
            ))}
          </select>
          <input
            required
            value={quantityWasted}
            onChange={(event) => setQuantityWasted(event.target.value)}
            placeholder="Quantity wasted"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
          <input
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
          <input
            required
            type="date"
            value={wasteDate}
            onChange={(event) => setWasteDate(event.target.value)}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={createWasteLog.isPending}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {createWasteLog.isPending ? "Saving..." : "Log waste"}
          </button>
        </form>

        {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
        {wasteLogsQuery.isLoading ? <p className="mt-4 text-sm text-zinc-600">Loading waste logs...</p> : null}
        {wasteLogsQuery.isError ? <p className="mt-4 text-sm text-red-600">Failed to load waste logs.</p> : null}
        {!wasteLogsQuery.isLoading &&
        !wasteLogsQuery.isError &&
        (wasteLogsQuery.data?.items.length ?? 0) === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">No waste logs yet.</p>
        ) : null}

        <ul className="mt-4 space-y-2">
          {wasteLogsQuery.data?.items.map((item) => (
            <li
              key={String(item.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold">{String(item.ingredientName)}</p>
                <p className="text-xs text-zinc-600">
                  {String(item.quantityWasted)} wasted | {String(item.reason)}
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
                {String(item.wasteDate).slice(0, 10)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

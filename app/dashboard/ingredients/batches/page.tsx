"use client";

import { FormEvent, useEffect, useState } from "react";
import { getAuthUserSerialized } from "@/lib/supabase-auth-user";
import { useBatchesQuery, useCloseBatchMutation, useCreateBatchMutation } from "@/lib/queries/batches";
import { useRecipesQuery } from "@/lib/queries/recipes";
import {
  DashboardPrimaryButton,
  DashboardSectionTitle,
  DashboardShell,
  DashboardStat,
  dashboardFieldClass,
} from "@/components/dashboard/page-shell";
import { panelLabelClass, panelFieldStackClass, RightFormPanel } from "@/components/dashboard/right-form-panel";

const toolbarBtn =
  "inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50";

type PanelKind = "none" | "start" | "close";

export default function BatchesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [panelKind, setPanelKind] = useState<PanelKind>("none");

  const [recipeId, setRecipeId] = useState("");
  const [expectedYield, setExpectedYield] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [actualYield, setActualYield] = useState("");
  const [waste, setWaste] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const user = await getAuthUserSerialized();
      setUserId(user?.id ?? null);
    }
    loadUser();
  }, []);

  const recipesQuery = useRecipesQuery(userId);
  const batchesQuery = useBatchesQuery(userId);
  const createBatch = useCreateBatchMutation();
  const closeBatch = useCloseBatchMutation();

  function openStartPanel() {
    setRecipeId("");
    setExpectedYield("");
    setErrorMessage(null);
    setPanelKind("start");
  }

  function openClosePanelEmpty() {
    setSelectedBatchId("");
    setActualYield("");
    setWaste("");
    setErrorMessage(null);
    setPanelKind("close");
  }

  function openClosePanelForBatch(batchId: string) {
    setSelectedBatchId(batchId);
    setActualYield("");
    setWaste("");
    setErrorMessage(null);
    setPanelKind("close");
  }

  async function handleCreateBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !recipeId) {
      setErrorMessage("Select a recipe.");
      return;
    }
    setErrorMessage(null);
    try {
      await createBatch.mutateAsync({
        userId,
        recipeId,
        expectedYield: expectedYield ? Number(expectedYield) : undefined,
      });
      setPanelKind("none");
    } catch {
      setErrorMessage("Could not create batch.");
    }
  }

  async function handleCloseBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !selectedBatchId) {
      setErrorMessage("Select a batch.");
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
      setPanelKind("none");
    } catch {
      setErrorMessage("Could not close batch.");
    }
  }

  const batches = batchesQuery.data?.items ?? [];
  const inProgressCount = batches.filter((batch) => String(batch.status) === "in_progress").length;

  return (
    <>
      <DashboardShell
        title="Batches"
        description="Start production runs, record actual yield and waste, then close batches."
        meta={<DashboardStat label="In progress" value={inProgressCount} />}
      >
        <div className="space-y-10">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={openStartPanel} className={toolbarBtn}>
              Start batch
            </button>
            <button type="button" onClick={openClosePanelEmpty} className={toolbarBtn}>
              Close batch
            </button>
          </div>

          {batchesQuery.isLoading ? <p className="text-sm text-zinc-500">Loading batches…</p> : null}
          {batchesQuery.isError ? (
            <p className="text-sm text-red-600">Failed to load batches.</p>
          ) : null}
          {!batchesQuery.isLoading && !batchesQuery.isError && (batchesQuery.data?.items.length ?? 0) === 0 ? (
            <p className="text-sm text-zinc-500">No batches yet.</p>
          ) : null}

          {batchesQuery.data && batchesQuery.data.items.length > 0 ? (
            <section>
              <DashboardSectionTitle>All batches</DashboardSectionTitle>
              <ul className="mt-4 divide-y divide-zinc-200 border-t border-zinc-200">
                {batchesQuery.data.items.map((batch) => {
                  const inProgress = String(batch.status) === "in_progress";
                  return (
                    <li key={String(batch.id)} className="flex flex-col gap-3 py-5 first:pt-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium text-zinc-900">{String(batch.recipeName)}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                          <span className="tabular-nums">Status {String(batch.status)}</span>
                          <span className="text-zinc-400"> · </span>
                          Expected {String(batch.expectedYield)}
                          <span className="text-zinc-400"> · </span>
                          Actual {String(batch.actualYield ?? "—")}
                          <span className="text-zinc-400"> · </span>
                          Waste {String(batch.wasteQuantity)}
                        </p>
                      </div>
                      {inProgress ? (
                        <button
                          type="button"
                          onClick={() => openClosePanelForBatch(String(batch.id))}
                          className={toolbarBtn}
                        >
                          Close this batch
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </DashboardShell>

      <RightFormPanel
        open={panelKind === "start"}
        onClose={() => setPanelKind("none")}
        title="Start batch"
      >
        <form onSubmit={handleCreateBatch} className="space-y-5">
          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className={panelFieldStackClass}>
            <label htmlFor="batch-recipe" className={panelLabelClass}>
              Recipe
            </label>
            <select
              id="batch-recipe"
              value={recipeId}
              onChange={(e) => setRecipeId(e.target.value)}
              required
              className={dashboardFieldClass}
            >
              <option value="">Select recipe</option>
              {recipesQuery.data?.items.map((recipe) => (
                <option key={String(recipe.id)} value={String(recipe.id)}>
                  {String(recipe.name)}
                </option>
              ))}
            </select>
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="batch-expected" className={panelLabelClass}>
              Expected yield
            </label>
            <input
              id="batch-expected"
              value={expectedYield}
              onChange={(e) => setExpectedYield(e.target.value)}
              placeholder="Optional"
              className={dashboardFieldClass}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <DashboardPrimaryButton type="submit" disabled={createBatch.isPending}>
              {createBatch.isPending ? "Creating…" : "Start batch"}
            </DashboardPrimaryButton>
            <button type="button" onClick={() => setPanelKind("none")} className={toolbarBtn}>
              Cancel
            </button>
          </div>
        </form>
      </RightFormPanel>

      <RightFormPanel
        open={panelKind === "close"}
        onClose={() => setPanelKind("none")}
        title="Close batch"
      >
        <form onSubmit={handleCloseBatch} className="space-y-5">
          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className={panelFieldStackClass}>
            <label htmlFor="batch-select" className={panelLabelClass}>
              In-progress batch
            </label>
            <select
              id="batch-select"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              required
              className={dashboardFieldClass}
            >
              <option value="">Select batch</option>
              {batchesQuery.data?.items
                .filter((batch) => String(batch.status) === "in_progress")
                .map((batch) => (
                  <option key={String(batch.id)} value={String(batch.id)}>
                    {String(batch.recipeName)} ({String(batch.id).slice(0, 8)})
                  </option>
                ))}
            </select>
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="batch-actual" className={panelLabelClass}>
              Actual yield
            </label>
            <input
              id="batch-actual"
              value={actualYield}
              onChange={(e) => setActualYield(e.target.value)}
              placeholder="Optional"
              className={dashboardFieldClass}
            />
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="batch-waste" className={panelLabelClass}>
              Waste quantity
            </label>
            <input
              id="batch-waste"
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
              placeholder="Optional"
              className={dashboardFieldClass}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <DashboardPrimaryButton type="submit" disabled={closeBatch.isPending}>
              {closeBatch.isPending ? "Closing…" : "Close batch"}
            </DashboardPrimaryButton>
            <button type="button" onClick={() => setPanelKind("none")} className={toolbarBtn}>
              Cancel
            </button>
          </div>
        </form>
      </RightFormPanel>
    </>
  );
}

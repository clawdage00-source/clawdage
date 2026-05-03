"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getAuthUserSerialized } from "@/lib/supabase-auth-user";
import { useIngredientsQuery } from "@/lib/queries/ingredients";
import {
  useCreateRecipeMutation,
  useRecipeDetailQuery,
  useRecipesQuery,
  useUpdateRecipeMutation,
} from "@/lib/queries/recipes";
import {
  DashboardPrimaryButton,
  DashboardSectionTitle,
  DashboardShell,
  DashboardStat,
  dashboardFieldClass,
  dashboardFieldMultilineClass,
} from "@/components/dashboard/page-shell";
import { panelLabelClass, panelFieldStackClass, RightFormPanel } from "@/components/dashboard/right-form-panel";

const toolbarBtn =
  "inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50";

const secondaryBtn =
  "inline-flex h-10 w-full shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 sm:w-auto";

export default function RecipesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [recipePanelMode, setRecipePanelMode] = useState<"create" | "edit">("create");
  const [editRecipeId, setEditRecipeId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [targetYield, setTargetYield] = useState("1");
  const [yieldUnit, setYieldUnit] = useState("portion");
  const [lineIngredientId, setLineIngredientId] = useState("");
  const [lineQty, setLineQty] = useState("");
  const [lineUnit, setLineUnit] = useState("g");
  const [lines, setLines] = useState<Array<{ ingredientId: string; quantity: number; unit: string }>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastHydratedEditId = useRef<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const user = await getAuthUserSerialized();
      setUserId(user?.id ?? null);
    }
    loadUser();
  }, []);

  const ingredientsQuery = useIngredientsQuery(userId, "", false);
  const recipesQuery = useRecipesQuery(userId);
  const recipeMainDetailQuery = useRecipeDetailQuery(userId, selectedRecipeId);
  const recipeEditDetailQuery = useRecipeDetailQuery(
    userId,
    panelOpen && recipePanelMode === "edit" && editRecipeId ? editRecipeId : null,
  );
  const createRecipe = useCreateRecipeMutation();
  const updateRecipe = useUpdateRecipeMutation();

  const ingredientNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const ingredient of ingredientsQuery.data?.items ?? []) {
      map.set(ingredient.id, ingredient.name);
    }
    return map;
  }, [ingredientsQuery.data?.items]);

  const ingredientCostById = useMemo(() => {
    const map = new Map<string, number>();
    for (const ingredient of ingredientsQuery.data?.items ?? []) {
      map.set(ingredient.id, Number(ingredient.costPerUnit ?? 0));
    }
    return map;
  }, [ingredientsQuery.data?.items]);

  const draftCost = lines.reduce(
    (sum, line) => sum + line.quantity * (ingredientCostById.get(line.ingredientId) ?? 0),
    0,
  );

  useEffect(() => {
    if (!panelOpen) {
      lastHydratedEditId.current = null;
      return;
    }
    if (recipePanelMode === "create") {
      setName("");
      setInstructions("");
      setTargetYield("1");
      setYieldUnit("portion");
      setLineIngredientId("");
      setLineQty("");
      setLineUnit("g");
      setLines([]);
      setErrorMessage(null);
      return;
    }
    if (!editRecipeId) {
      return;
    }
    const d = recipeEditDetailQuery.data;
    if (!d || recipeEditDetailQuery.isLoading) {
      return;
    }
    if (lastHydratedEditId.current === editRecipeId) {
      return;
    }
    lastHydratedEditId.current = editRecipeId;
    setName(String(d.recipe.name ?? ""));
    setInstructions(String(d.recipe.instructions ?? ""));
    setTargetYield(String(d.recipe.targetYield ?? "1"));
    setYieldUnit(String(d.recipe.yieldUnit ?? "portion"));
    setLines(
      d.lines.map((line) => ({
        ingredientId: String(line.ingredientId),
        quantity: Number(line.quantity),
        unit: String(line.unit),
      })),
    );
    setErrorMessage(null);
  }, [panelOpen, recipePanelMode, editRecipeId, recipeEditDetailQuery.data, recipeEditDetailQuery.isLoading]);

  function openCreateRecipe() {
    setRecipePanelMode("create");
    setEditRecipeId(null);
    setPanelOpen(true);
  }

  function openEditRecipe(id: string) {
    setRecipePanelMode("edit");
    setEditRecipeId(id);
    lastHydratedEditId.current = null;
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditRecipeId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setErrorMessage("Please sign in again.");
      return;
    }
    setErrorMessage(null);
    try {
      if (recipePanelMode === "create") {
        await createRecipe.mutateAsync({
          userId,
          name,
          instructions,
          targetYield: Number(targetYield),
          yieldUnit,
          lines,
        });
        closePanel();
      } else if (editRecipeId) {
        await updateRecipe.mutateAsync({
          recipeId: editRecipeId,
          payload: {
            userId,
            name,
            instructions,
            targetYield: Number(targetYield),
            yieldUnit,
            lines,
          },
        });
        closePanel();
      }
    } catch {
      setErrorMessage(recipePanelMode === "create" ? "Could not create recipe." : "Could not update recipe.");
    }
  }

  const recipes = recipesQuery.data?.items ?? [];
  const pending = createRecipe.isPending || updateRecipe.isPending;

  return (
    <>
      <DashboardShell
        title="Recipes"
        description="Define yield, instructions, ingredient lines, and theoretical cost."
        meta={<DashboardStat label="Recipes" value={recipes.length} />}
      >
        <div className="space-y-10">
          <button type="button" onClick={openCreateRecipe} className={toolbarBtn}>
            Add recipe
          </button>

          {recipesQuery.isLoading ? <p className="text-sm text-zinc-500">Loading recipes…</p> : null}
          {recipesQuery.isError ? (
            <p className="text-sm text-red-600">Failed to load recipes.</p>
          ) : null}
          {!recipesQuery.isLoading && !recipesQuery.isError && (recipesQuery.data?.items.length ?? 0) === 0 ? (
            <p className="text-sm text-zinc-500">No recipes yet.</p>
          ) : null}

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <section>
              <DashboardSectionTitle>Library</DashboardSectionTitle>
              <ul className="mt-4 divide-y divide-zinc-200 border-t border-zinc-200">
                {recipesQuery.data?.items.map((recipe) => (
                  <li
                    key={String(recipe.id)}
                    className="flex flex-col gap-3 py-5 first:pt-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-[15px] font-medium text-zinc-900">{String(recipe.name)}</p>
                      <p className="text-sm text-zinc-600">
                        Version {String(recipe.version)}
                        <span className="text-zinc-400"> · </span>
                        Cost{" "}
                        <span className="tabular-nums">{Number(recipe.theoreticalCost ?? 0).toFixed(2)}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRecipeId(String(recipe.id))}
                        className={toolbarBtn}
                      >
                        View
                      </button>
                      <button type="button" onClick={() => openEditRecipe(String(recipe.id))} className={toolbarBtn}>
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <DashboardSectionTitle>Detail</DashboardSectionTitle>
              <div className="mt-4 border-t border-zinc-200 pt-4">
                {selectedRecipeId && recipeMainDetailQuery.isLoading ? (
                  <p className="text-sm text-zinc-500">Loading…</p>
                ) : null}
                {selectedRecipeId && recipeMainDetailQuery.data ? (
                  <ul className="space-y-3 text-sm text-zinc-700">
                    {recipeMainDetailQuery.data.lines.map((line) => (
                      <li key={String(line.id)} className="leading-relaxed">
                        <span className="font-medium text-zinc-900">{String(line.ingredientName)}</span>
                        <span className="text-zinc-400"> · </span>
                        {String(line.quantity)} {String(line.unit)}
                        <span className="text-zinc-400"> · </span>
                        Unit cost {String(line.costPerUnit ?? "—")}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">Select a recipe to inspect lines.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </DashboardShell>

      <RightFormPanel
        open={panelOpen}
        onClose={closePanel}
        title={recipePanelMode === "create" ? "Add recipe" : "Edit recipe"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {recipePanelMode === "edit" && recipeEditDetailQuery.isLoading ? (
            <p className="text-sm text-zinc-500">Loading recipe…</p>
          ) : null}
          <div className={panelFieldStackClass}>
            <label htmlFor="rec-name" className={panelLabelClass}>
              Name
            </label>
            <input
              id="rec-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={dashboardFieldClass}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={panelFieldStackClass}>
              <label htmlFor="rec-yield" className={panelLabelClass}>
                Target yield
              </label>
              <input
                id="rec-yield"
                value={targetYield}
                onChange={(e) => setTargetYield(e.target.value)}
                className={dashboardFieldClass}
              />
            </div>
            <div className={panelFieldStackClass}>
              <label htmlFor="rec-yunit" className={panelLabelClass}>
                Yield unit
              </label>
              <input
                id="rec-yunit"
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value)}
                className={dashboardFieldClass}
              />
            </div>
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="rec-inst" className={panelLabelClass}>
              Instructions
            </label>
            <textarea
              id="rec-inst"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className={dashboardFieldMultilineClass}
            />
          </div>

          <div className="space-y-4 border-t border-zinc-200 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Ingredient lines</p>
            <div className="flex flex-col gap-3">
              <select
                value={lineIngredientId}
                onChange={(e) => setLineIngredientId(e.target.value)}
                className={dashboardFieldClass}
              >
                <option value="">Ingredient</option>
                {ingredientsQuery.data?.items.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={lineQty}
                  onChange={(e) => setLineQty(e.target.value)}
                  placeholder="Quantity"
                  className={dashboardFieldClass}
                />
                <input
                  value={lineUnit}
                  onChange={(e) => setLineUnit(e.target.value)}
                  placeholder="Unit"
                  className={dashboardFieldClass}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!lineIngredientId || !lineQty) {
                    return;
                  }
                  setLines((prev) => [
                    ...prev,
                    { ingredientId: lineIngredientId, quantity: Number(lineQty), unit: lineUnit },
                  ]);
                  setLineIngredientId("");
                  setLineQty("");
                }}
                className={secondaryBtn}
              >
                Add line
              </button>
            </div>
            <p className="text-sm text-zinc-600">
              Draft cost{" "}
              <span className="font-medium tabular-nums text-zinc-900">{draftCost.toFixed(2)}</span>
              <span className="text-zinc-400"> · </span>
              Per {yieldUnit}{" "}
              <span className="font-medium tabular-nums text-zinc-900">
                {(draftCost / Math.max(Number(targetYield) || 1, 1)).toFixed(2)}
              </span>
            </p>
            <ul className="space-y-1.5 text-sm text-zinc-700">
              {lines.map((line, idx) => (
                <li key={`${line.ingredientId}-${idx}`} className="flex items-center justify-between gap-2">
                  <span>
                    {ingredientNameById.get(line.ingredientId) ?? line.ingredientId.slice(0, 8)} — {line.quantity}{" "}
                    {line.unit}
                  </span>
                  <button
                    type="button"
                    className="text-xs font-medium text-zinc-500 hover:text-red-600"
                    onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <DashboardPrimaryButton type="submit" disabled={pending || (recipePanelMode === "edit" && recipeEditDetailQuery.isLoading)}>
              {pending ? "Saving…" : recipePanelMode === "create" ? "Create recipe" : "Save changes"}
            </DashboardPrimaryButton>
            <button type="button" onClick={closePanel} className={toolbarBtn}>
              Cancel
            </button>
          </div>
        </form>
      </RightFormPanel>
    </>
  );
}

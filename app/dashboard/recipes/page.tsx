"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useIngredientsQuery } from "@/lib/queries/ingredients";
import { useCreateRecipeMutation, useRecipeDetailQuery, useRecipesQuery } from "@/lib/queries/recipes";

export default function RecipesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [targetYield, setTargetYield] = useState("1");
  const [yieldUnit, setYieldUnit] = useState("portion");
  const [lineIngredientId, setLineIngredientId] = useState("");
  const [lineQty, setLineQty] = useState("");
  const [lineUnit, setLineUnit] = useState("g");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [lines, setLines] = useState<Array<{ ingredientId: string; quantity: number; unit: string }>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    }
    loadUser();
  }, []);

  const ingredientsQuery = useIngredientsQuery(userId, "", false);
  const recipesQuery = useRecipesQuery(userId);
  const recipeDetailQuery = useRecipeDetailQuery(userId, selectedRecipeId);
  const createRecipe = useCreateRecipeMutation();
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

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setErrorMessage("Please login again.");
      return;
    }
    setErrorMessage(null);
    try {
      await createRecipe.mutateAsync({
        userId,
        name,
        instructions,
        targetYield: Number(targetYield),
        yieldUnit,
        lines,
      });
      setName("");
      setInstructions("");
      setTargetYield("1");
      setYieldUnit("portion");
      setLines([]);
    } catch {
      setErrorMessage("Could not create recipe.");
    }
  }

  const recipes = recipesQuery.data?.items ?? [];

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-white/50 bg-white/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_34px_rgba(0,0,0,0.09)] supports-[backdrop-filter]:bg-white/72 supports-[backdrop-filter]:backdrop-blur-lg md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Recipes</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Build recipes with ingredient lines and theoretical costing.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Total Recipes</p>
            <p className="text-lg font-semibold">{recipes.length}</p>
          </div>
        </div>

      <form onSubmit={handleCreate} className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Recipe name" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
          <input value={targetYield} onChange={(e) => setTargetYield(e.target.value)} placeholder="Target yield" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
          <input value={yieldUnit} onChange={(e) => setYieldUnit(e.target.value)} placeholder="Yield unit" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
            {createRecipe.isPending ? "Saving..." : "Create recipe"}
          </button>
        </div>
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions" className="mt-3 min-h-24 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />

        <div className="mt-4 rounded-xl border border-zinc-200 p-3">
          <p className="text-sm font-semibold">Ingredient lines</p>
          <div className="mt-2 grid gap-2 md:grid-cols-5">
            <select value={lineIngredientId} onChange={(e) => setLineIngredientId(e.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
              <option value="">Select ingredient</option>
              {ingredientsQuery.data?.items.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
            </select>
            <input value={lineQty} onChange={(e) => setLineQty(e.target.value)} placeholder="Quantity" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            <input value={lineUnit} onChange={(e) => setLineUnit(e.target.value)} placeholder="Unit" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            <button
              type="button"
              onClick={() => {
                if (!lineIngredientId || !lineQty) {
                  return;
                }
                setLines((prev) => [...prev, { ingredientId: lineIngredientId, quantity: Number(lineQty), unit: lineUnit }]);
                setLineIngredientId("");
                setLineQty("");
              }}
              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            >
              Add line
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-600">
            Draft theoretical cost: {draftCost.toFixed(2)} | Cost per {yieldUnit}: {(draftCost / Math.max(Number(targetYield) || 1, 1)).toFixed(2)}
          </p>
          <ul className="mt-2 space-y-1">
            {lines.map((line, idx) => (
              <li key={`${line.ingredientId}-${idx}`} className="text-xs text-zinc-700">
                {ingredientNameById.get(line.ingredientId) ?? line.ingredientId.slice(0, 8)} - {line.quantity} {line.unit}
              </li>
            ))}
          </ul>
        </div>
      </form>

      {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
      {recipesQuery.isLoading ? <p className="mt-4 text-sm text-zinc-600">Loading recipes...</p> : null}
      {recipesQuery.isError ? <p className="mt-4 text-sm text-red-600">Failed to load recipes.</p> : null}
      {!recipesQuery.isLoading && !recipesQuery.isError && (recipesQuery.data?.items.length ?? 0) === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">No recipes yet.</p>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ul className="space-y-2">
          {recipesQuery.data?.items.map((recipe) => (
            <li key={String(recipe.id)} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{String(recipe.name)}</p>
                <p className="text-xs text-zinc-600">
                  Version {String(recipe.version)} | Cost {Number(recipe.theoreticalCost ?? 0).toFixed(2)}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedRecipeId(String(recipe.id))} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs">
                View lines
              </button>
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-semibold">Recipe detail</p>
          {recipeDetailQuery.isLoading ? <p className="mt-2 text-xs text-zinc-600">Loading detail...</p> : null}
          {recipeDetailQuery.data ? (
            <ul className="mt-2 space-y-1">
              {recipeDetailQuery.data.lines.map((line) => (
                <li key={String(line.id)} className="text-xs text-zinc-700">
                  {String(line.ingredientName)} - {String(line.quantity)} {String(line.unit)} | unit cost {String(line.costPerUnit ?? "-")}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-zinc-600">Select a recipe to inspect ingredient lines.</p>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}

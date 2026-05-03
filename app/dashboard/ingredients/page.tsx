"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { getAuthUserSerialized } from "@/lib/supabase-auth-user";
import {
  type Ingredient,
  useCreateIngredientMutation,
  useIngredientsQuery,
  useUpdateIngredientMutation,
} from "@/lib/queries/ingredients";
import {
  DashboardPrimaryButton,
  DashboardSectionTitle,
  DashboardShell,
  DashboardStat,
  dashboardFieldClass,
} from "@/components/dashboard/page-shell";
import { panelLabelClass, panelFieldStackClass, RightFormPanel } from "@/components/dashboard/right-form-panel";

const unitOptions = ["kg", "g", "l", "ml", "pcs", "pack", "tray"];

const toolbarBtn =
  "inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50";

export default function IngredientsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [parLevel, setParLevel] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [isArchived, setIsArchived] = useState(false);

  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hydratedEditId = useRef<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const user = await getAuthUserSerialized();
      setUserId(user?.id ?? null);
    }
    loadUser();
  }, []);

  const ingredientsQuery = useIngredientsQuery(userId, search, lowStockOnly);
  const createIngredient = useCreateIngredientMutation();
  const updateIngredient = useUpdateIngredientMutation();

  const ingredients = ingredientsQuery.data?.items ?? [];

  useEffect(() => {
    if (!panelOpen) {
      hydratedEditId.current = null;
      return;
    }
    if (panelMode === "create") {
      setName("");
      setUnit("kg");
      setParLevel("");
      setCostPerUnit("");
      setCurrentStock("");
      setIsArchived(false);
      setErrorMessage(null);
      return;
    }
    if (panelMode === "edit" && editingItem && hydratedEditId.current !== editingItem.id) {
      hydratedEditId.current = editingItem.id;
      setName(editingItem.name);
      setUnit(editingItem.unit);
      setParLevel(editingItem.parLevel ?? "");
      setCostPerUnit(editingItem.costPerUnit ?? "");
      setCurrentStock(String(editingItem.currentStock ?? ""));
      setIsArchived(editingItem.isArchived);
      setErrorMessage(null);
    }
  }, [panelOpen, panelMode, editingItem]);

  function openCreate() {
    setPanelMode("create");
    setEditingItem(null);
    setPanelOpen(true);
  }

  function openEdit(item: Ingredient) {
    setPanelMode("edit");
    setEditingItem(item);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingItem(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setErrorMessage("Please sign in again.");
      return;
    }
    setErrorMessage(null);
    try {
      if (panelMode === "create") {
        await createIngredient.mutateAsync({
          userId,
          name,
          unit,
          parLevel: parLevel ? Number(parLevel) : undefined,
          costPerUnit: costPerUnit ? Number(costPerUnit) : undefined,
          currentStock: currentStock ? Number(currentStock) : undefined,
        });
        closePanel();
      } else if (editingItem) {
        await updateIngredient.mutateAsync({
          ingredientId: editingItem.id,
          payload: {
            userId,
            name,
            unit,
            parLevel: parLevel ? Number(parLevel) : undefined,
            costPerUnit: costPerUnit ? Number(costPerUnit) : undefined,
            currentStock: currentStock ? Number(currentStock) : undefined,
            isArchived,
          },
        });
        closePanel();
      }
    } catch {
      setErrorMessage(panelMode === "create" ? "Could not create ingredient." : "Could not update ingredient.");
    }
  }

  const pending = createIngredient.isPending || updateIngredient.isPending;

  return (
    <>
      <DashboardShell
        title="Ingredients"
        description="Stock levels, unit cost, par targets, and archive status."
        meta={<DashboardStat label="Line items" value={ingredients.length} />}
      >
        <section className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={openCreate} className={toolbarBtn}>
              Add ingredient
            </button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name"
                className={`${dashboardFieldClass} sm:w-64`}
              />
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                />
                Low stock only
              </label>
            </div>
          </div>

          {ingredientsQuery.isLoading ? (
            <p className="text-sm text-zinc-500">Loading ingredients…</p>
          ) : null}
          {ingredientsQuery.isError ? (
            <p className="text-sm text-red-600">Failed to load ingredients.</p>
          ) : null}

          {!ingredientsQuery.isLoading &&
          !ingredientsQuery.isError &&
          (ingredientsQuery.data?.items.length ?? 0) === 0 ? (
            <p className="text-sm text-zinc-500">No ingredients yet. Use Add ingredient.</p>
          ) : null}

          {!ingredientsQuery.isLoading && !ingredientsQuery.isError && ingredients.length > 0 ? (
            <div>
              <DashboardSectionTitle>Inventory</DashboardSectionTitle>
              <ul className="mt-4 divide-y divide-zinc-200 border-t border-zinc-200">
                {ingredientsQuery.data?.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 py-5 first:pt-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-[15px] font-medium text-zinc-900">{item.name}</p>
                      <p className="text-sm text-zinc-600">
                        {item.currentStock} {item.unit}
                        <span className="text-zinc-400"> · </span>
                        Par {item.parLevel ?? "—"}
                        <span className="text-zinc-400"> · </span>
                        Cost {item.costPerUnit ?? "—"}
                        {item.isArchived ? (
                          <>
                            <span className="text-zinc-400"> · </span>
                            <span className="text-amber-700">Archived</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <button type="button" onClick={() => openEdit(item)} className={toolbarBtn}>
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </DashboardShell>

      <RightFormPanel
        open={panelOpen}
        onClose={closePanel}
        title={panelMode === "create" ? "Add ingredient" : "Edit ingredient"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className={panelFieldStackClass}>
            <label htmlFor="ing-name" className={panelLabelClass}>
              Name
            </label>
            <input
              id="ing-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={dashboardFieldClass}
            />
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="ing-unit" className={panelLabelClass}>
              Unit
            </label>
            <select id="ing-unit" value={unit} onChange={(e) => setUnit(e.target.value)} className={dashboardFieldClass}>
              {unitOptions.map((option) => (
                <option key={option} value={option}>
                  {option.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="ing-par" className={panelLabelClass}>
              Par level
            </label>
            <input
              id="ing-par"
              value={parLevel}
              onChange={(e) => setParLevel(e.target.value)}
              placeholder="Optional"
              className={dashboardFieldClass}
            />
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="ing-cost" className={panelLabelClass}>
              Cost per unit
            </label>
            <input
              id="ing-cost"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
              placeholder="Optional"
              className={dashboardFieldClass}
            />
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="ing-stock" className={panelLabelClass}>
              Current stock
            </label>
            <input
              id="ing-stock"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              placeholder="0"
              className={dashboardFieldClass}
            />
          </div>
          {panelMode === "edit" ? (
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={isArchived}
                onChange={(e) => setIsArchived(e.target.checked)}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
              />
              Archived
            </label>
          ) : null}
          <div className="flex gap-3 pt-2">
            <DashboardPrimaryButton type="submit" disabled={pending}>
              {pending ? "Saving…" : panelMode === "create" ? "Create" : "Save changes"}
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

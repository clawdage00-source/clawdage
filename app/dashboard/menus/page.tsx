"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getAuthUserSerialized } from "@/lib/supabase-auth-user";
import {
  useCreateMenuMutation,
  useMenuDetailQuery,
  useMenusQuery,
  useUpdateMenuMutation,
} from "@/lib/queries/menus";
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

const secondaryBtn =
  "inline-flex h-10 w-full shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 sm:w-auto";

type DraftItem = { recipeId: string; sellPrice: number; isAvailable: boolean };

export default function MenusPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [menuPanelMode, setMenuPanelMode] = useState<"create" | "edit">("create");
  const [editMenuId, setEditMenuId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [channel, setChannel] = useState("inhouse");
  const [serviceWindow, setServiceWindow] = useState("all_day");
  const [isPublished, setIsPublished] = useState(false);
  const [recipeId, setRecipeId] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastHydratedMenuId = useRef<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const user = await getAuthUserSerialized();
      setUserId(user?.id ?? null);
    }
    loadUser();
  }, []);

  const recipesQuery = useRecipesQuery(userId);
  const menusQuery = useMenusQuery(userId);
  const menuMarginsQuery = useMenuDetailQuery(userId, selectedMenuId);
  const menuEditQuery = useMenuDetailQuery(
    userId,
    panelOpen && menuPanelMode === "edit" && editMenuId ? editMenuId : null,
  );
  const createMenu = useCreateMenuMutation();
  const updateMenu = useUpdateMenuMutation();

  const recipeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of recipesQuery.data?.items ?? []) {
      map.set(String(r.id), String(r.name));
    }
    return map;
  }, [recipesQuery.data?.items]);

  useEffect(() => {
    if (!panelOpen) {
      lastHydratedMenuId.current = null;
      return;
    }
    if (menuPanelMode === "create") {
      setName("");
      setChannel("inhouse");
      setServiceWindow("all_day");
      setIsPublished(false);
      setRecipeId("");
      setSellPrice("");
      setItems([]);
      setErrorMessage(null);
      return;
    }
    if (!editMenuId) {
      return;
    }
    const d = menuEditQuery.data;
    if (!d || menuEditQuery.isLoading) {
      return;
    }
    if (lastHydratedMenuId.current === editMenuId) {
      return;
    }
    lastHydratedMenuId.current = editMenuId;
    const m = d.menu;
    setName(String(m.name ?? ""));
    setChannel(String(m.channel ?? "inhouse"));
    setServiceWindow(String(m.serviceWindow ?? "all_day"));
    setIsPublished(Boolean(m.isPublished));
    setItems(
      d.items.map((row) => ({
        recipeId: String(row.recipeId),
        sellPrice: Number(row.sellPrice),
        isAvailable: row.isAvailable !== false,
      })),
    );
    setRecipeId("");
    setSellPrice("");
    setErrorMessage(null);
  }, [panelOpen, menuPanelMode, editMenuId, menuEditQuery.data, menuEditQuery.isLoading]);

  function openCreateMenu() {
    setMenuPanelMode("create");
    setEditMenuId(null);
    lastHydratedMenuId.current = null;
    setPanelOpen(true);
  }

  function openEditMenu(id: string) {
    setMenuPanelMode("edit");
    setEditMenuId(id);
    lastHydratedMenuId.current = null;
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditMenuId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setErrorMessage("Please sign in again.");
      return;
    }
    setErrorMessage(null);
    try {
      if (menuPanelMode === "create") {
        await createMenu.mutateAsync({
          userId,
          name,
          channel,
          serviceWindow,
          isPublished,
          items,
        });
        closePanel();
      } else if (editMenuId) {
        await updateMenu.mutateAsync({
          menuId: editMenuId,
          payload: {
            userId,
            name,
            channel,
            serviceWindow,
            isPublished,
            items,
          },
        });
        closePanel();
      }
    } catch {
      setErrorMessage(menuPanelMode === "create" ? "Could not create menu." : "Could not update menu.");
    }
  }

  const menus = menusQuery.data?.items ?? [];
  const pending = createMenu.isPending || updateMenu.isPending;

  return (
    <>
      <DashboardShell
        title="Menus"
        description="Channel menus, service windows, and item-level margin estimates."
        meta={<DashboardStat label="Menus" value={menus.length} />}
      >
        <div className="space-y-10">
          <button type="button" onClick={openCreateMenu} className={toolbarBtn}>
            Add menu
          </button>

          {menusQuery.isLoading ? <p className="text-sm text-zinc-500">Loading menus…</p> : null}
          {menusQuery.isError ? <p className="text-sm text-red-600">Failed to load menus.</p> : null}
          {!menusQuery.isLoading && !menusQuery.isError && (menusQuery.data?.items.length ?? 0) === 0 ? (
            <p className="text-sm text-zinc-500">No menus yet.</p>
          ) : null}

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <section>
              <DashboardSectionTitle>Library</DashboardSectionTitle>
              <ul className="mt-4 divide-y divide-zinc-200 border-t border-zinc-200">
                {menusQuery.data?.items.map((menu) => (
                  <li
                    key={String(menu.id)}
                    className="flex flex-col gap-3 py-5 first:pt-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-[15px] font-medium text-zinc-900">{String(menu.name)}</p>
                      <p className="text-sm text-zinc-600">
                        {String(menu.channel)} / {String(menu.serviceWindow)}
                        <span className="text-zinc-400"> · </span>
                        {String(menu.itemCount)} items
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMenuId(String(menu.id))}
                        className={toolbarBtn}
                      >
                        Margins
                      </button>
                      <button type="button" onClick={() => openEditMenu(String(menu.id))} className={toolbarBtn}>
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <DashboardSectionTitle>Margin snapshot</DashboardSectionTitle>
              <div className="mt-4 border-t border-zinc-200 pt-4">
                {selectedMenuId && menuMarginsQuery.isLoading ? (
                  <p className="text-sm text-zinc-500">Loading…</p>
                ) : null}
                {selectedMenuId && menuMarginsQuery.data ? (
                  <ul className="space-y-3 text-sm text-zinc-700">
                    {menuMarginsQuery.data.items.map((item) => {
                      const recipeCost = Number(item.recipeCost ?? 0);
                      const price = Number(item.sellPrice ?? 0);
                      const margin = price - recipeCost;
                      return (
                        <li key={String(item.id)} className="leading-relaxed">
                          <span className="font-medium text-zinc-900">{String(item.recipeName)}</span>
                          <span className="text-zinc-400"> · </span>
                          <span className="tabular-nums">Price {price.toFixed(2)}</span>
                          <span className="text-zinc-400"> · </span>
                          <span className="tabular-nums">Cost {recipeCost.toFixed(2)}</span>
                          <span className="text-zinc-400"> · </span>
                          <span className="tabular-nums">Margin {margin.toFixed(2)}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">Select a menu for item-level margins.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </DashboardShell>

      <RightFormPanel
        open={panelOpen}
        onClose={closePanel}
        title={menuPanelMode === "create" ? "Add menu" : "Edit menu"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {menuPanelMode === "edit" && menuEditQuery.isLoading ? (
            <p className="text-sm text-zinc-500">Loading menu…</p>
          ) : null}
          <div className={panelFieldStackClass}>
            <label htmlFor="menu-name" className={panelLabelClass}>
              Menu name
            </label>
            <input
              id="menu-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={dashboardFieldClass}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={panelFieldStackClass}>
              <label htmlFor="menu-ch" className={panelLabelClass}>
                Channel
              </label>
              <input
                id="menu-ch"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className={dashboardFieldClass}
              />
            </div>
            <div className={panelFieldStackClass}>
              <label htmlFor="menu-sw" className={panelLabelClass}>
                Service window
              </label>
              <input
                id="menu-sw"
                value={serviceWindow}
                onChange={(e) => setServiceWindow(e.target.value)}
                className={dashboardFieldClass}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
            />
            Published
          </label>

          <div className="space-y-4 border-t border-zinc-200 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Menu items</p>
            <div className="flex flex-col gap-3">
              <select value={recipeId} onChange={(e) => setRecipeId(e.target.value)} className={dashboardFieldClass}>
                <option value="">Recipe</option>
                {recipesQuery.data?.items.map((r) => (
                  <option key={String(r.id)} value={String(r.id)}>
                    {String(r.name)}
                  </option>
                ))}
              </select>
              <input
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="Sell price"
                className={dashboardFieldClass}
              />
              <button
                type="button"
                onClick={() => {
                  if (!recipeId || !sellPrice) {
                    return;
                  }
                  setItems((prev) => [...prev, { recipeId, sellPrice: Number(sellPrice), isAvailable: true }]);
                  setRecipeId("");
                  setSellPrice("");
                }}
                className={secondaryBtn}
              >
                Add item
              </button>
            </div>
            <ul className="space-y-2 text-sm text-zinc-700">
              {items.map((item, idx) => (
                <li key={`${item.recipeId}-${idx}`} className="flex items-center justify-between gap-2">
                  <span className="tabular-nums">
                    {recipeNameById.get(item.recipeId) ?? item.recipeId.slice(0, 8)} — {item.sellPrice.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className="text-xs font-medium text-zinc-500 hover:text-red-600"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <DashboardPrimaryButton
              type="submit"
              disabled={pending || (menuPanelMode === "edit" && menuEditQuery.isLoading)}
            >
              {pending ? "Saving…" : menuPanelMode === "create" ? "Create menu" : "Save changes"}
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

"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useCreateMenuMutation, useMenuDetailQuery, useMenusQuery } from "@/lib/queries/menus";
import { useRecipesQuery } from "@/lib/queries/recipes";

export default function MenusPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("inhouse");
  const [serviceWindow, setServiceWindow] = useState("all_day");
  const [recipeId, setRecipeId] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [items, setItems] = useState<Array<{ recipeId: string; sellPrice: number; isAvailable: boolean }>>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    }
    loadUser();
  }, []);

  const recipesQuery = useRecipesQuery(userId);
  const menusQuery = useMenusQuery(userId);
  const menuDetailQuery = useMenuDetailQuery(userId, selectedMenuId);
  const createMenu = useCreateMenuMutation();

  async function handleCreateMenu(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setErrorMessage("Please login again.");
      return;
    }
    setErrorMessage(null);
    try {
      await createMenu.mutateAsync({
        userId,
        name,
        channel,
        serviceWindow,
        items,
      });
      setName("");
      setItems([]);
    } catch {
      setErrorMessage("Could not create menu.");
    }
  }

  const menus = menusQuery.data?.items ?? [];

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="rounded-3xl border border-white/50 bg-white/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_34px_rgba(0,0,0,0.09)] supports-[backdrop-filter]:bg-white/72 supports-[backdrop-filter]:backdrop-blur-lg md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Menus</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Create channel-based menus and track margin performance.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Total Menus</p>
            <p className="text-lg font-semibold">{menus.length}</p>
          </div>
        </div>

      <form onSubmit={handleCreateMenu} className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Menu name" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
          <input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Channel" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
          <input value={serviceWindow} onChange={(e) => setServiceWindow(e.target.value)} placeholder="Service window" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
            {createMenu.isPending ? "Saving..." : "Create menu"}
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-200 p-3">
          <p className="text-sm font-semibold">Menu items</p>
          <div className="mt-2 grid gap-2 md:grid-cols-4">
            <select value={recipeId} onChange={(e) => setRecipeId(e.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
              <option value="">Select recipe</option>
              {recipesQuery.data?.items.map((recipe) => (
                <option key={String(recipe.id)} value={String(recipe.id)}>
                  {String(recipe.name)}
                </option>
              ))}
            </select>
            <input value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} placeholder="Sell price" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
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
              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            >
              Add menu item
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {items.map((item, idx) => (
              <li key={`${item.recipeId}-${idx}`} className="text-xs text-zinc-700">
                {item.recipeId.slice(0, 8)} - {item.sellPrice.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      </form>

      {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
      {menusQuery.isLoading ? <p className="mt-4 text-sm text-zinc-600">Loading menus...</p> : null}
      {menusQuery.isError ? <p className="mt-4 text-sm text-red-600">Failed to load menus.</p> : null}
      {!menusQuery.isLoading && !menusQuery.isError && (menusQuery.data?.items.length ?? 0) === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">No menus yet.</p>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ul className="space-y-2">
          {menusQuery.data?.items.map((menu) => (
            <li key={String(menu.id)} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{String(menu.name)}</p>
                <p className="text-xs text-zinc-600">
                  {String(menu.channel)} / {String(menu.serviceWindow)} | items {String(menu.itemCount)}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedMenuId(String(menu.id))} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs">
                View margin
              </button>
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-semibold">Menu detail (margin snapshot)</p>
          {menuDetailQuery.isLoading ? <p className="mt-2 text-xs text-zinc-600">Loading detail...</p> : null}
          {menuDetailQuery.data ? (
            <ul className="mt-2 space-y-1">
              {menuDetailQuery.data.items.map((item) => {
                const recipeCost = Number(item.recipeCost ?? 0);
                const price = Number(item.sellPrice ?? 0);
                const margin = price - recipeCost;
                return (
                  <li key={String(item.id)} className="text-xs text-zinc-700">
                    {String(item.recipeName)} | price {price.toFixed(2)} | cost {recipeCost.toFixed(2)} | margin {margin.toFixed(2)}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-zinc-600">Select a menu to see item-level margin estimate.</p>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}

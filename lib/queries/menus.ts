"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type MenuItemInput = {
  recipeId: string;
  sellPrice: number;
  isAvailable?: boolean;
};

type MenuInput = {
  userId: string;
  name: string;
  channel?: string;
  serviceWindow?: string;
  isPublished?: boolean;
  items?: MenuItemInput[];
};

export function useMenusQuery(userId: string | null) {
  return useQuery({
    queryKey: ["menus", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const res = await fetch(`/api/menus?userId=${encodeURIComponent(userId ?? "")}`);
      if (!res.ok) {
        throw new Error("Failed to fetch menus");
      }
      return res.json() as Promise<{ items: Array<Record<string, unknown>> }>;
    },
  });
}

export function useMenuDetailQuery(userId: string | null, menuId: string | null) {
  return useQuery({
    queryKey: ["menu", userId, menuId],
    enabled: Boolean(userId && menuId),
    queryFn: async () => {
      const res = await fetch(`/api/menus/${menuId}?userId=${encodeURIComponent(userId ?? "")}`);
      if (!res.ok) {
        throw new Error("Failed to fetch menu details");
      }
      return res.json() as Promise<{ menu: Record<string, unknown>; items: Array<Record<string, unknown>> }>;
    },
  });
}

export function useCreateMenuMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MenuInput) => {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to create menu");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
}

export function useUpdateMenuMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      menuId,
      payload,
    }: {
      menuId: string;
      payload: Partial<MenuInput> & { userId: string; isArchived?: boolean };
    }) => {
      const res = await fetch(`/api/menus/${menuId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to update menu");
      }
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menu", vars.payload.userId, vars.menuId] });
    },
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Ingredient = {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  sku: string | null;
  vendorName: string | null;
  parLevel: string | null;
  currentStock: string;
  costPerUnit: string | null;
  isArchived: boolean;
  updatedAt: string | null;
};

export const ingredientsQueryKey = (userId: string | null, q: string, lowStockOnly: boolean) =>
  ["ingredients", userId, q, lowStockOnly] as const;

type IngredientInput = {
  userId: string;
  name: string;
  category?: string;
  unit: string;
  sku?: string;
  vendorName?: string;
  parLevel?: number;
  currentStock?: number;
  costPerUnit?: number;
};

export function useIngredientsQuery(userId: string | null, q: string, lowStockOnly: boolean) {
  return useQuery({
    queryKey: ingredientsQueryKey(userId, q, lowStockOnly),
    enabled: Boolean(userId),
    queryFn: async (): Promise<{ items: Ingredient[] }> => {
      const params = new URLSearchParams({
        userId: userId ?? "",
        q,
        lowStockOnly: String(lowStockOnly),
      });
      const res = await fetch(`/api/ingredients?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch ingredients");
      }
      return (await res.json()) as { items: Ingredient[] };
    },
  });
}

export function useCreateIngredientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: IngredientInput) => {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to create ingredient");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useUpdateIngredientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ingredientId,
      payload,
    }: {
      ingredientId: string;
      payload: Partial<IngredientInput> & { userId: string; isArchived?: boolean };
    }) => {
      const res = await fetch(`/api/ingredients/${ingredientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to update ingredient");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

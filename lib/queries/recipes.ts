"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type RecipeLineInput = {
  ingredientId: string;
  quantity: number;
  unit: string;
};

type RecipeInput = {
  userId: string;
  name: string;
  instructions?: string;
  targetYield?: number;
  yieldUnit?: string;
  lines?: RecipeLineInput[];
};

export const recipesQueryKey = (userId: string | null) => ["recipes", userId] as const;

export function useRecipesQuery(userId: string | null) {
  return useQuery({
    queryKey: recipesQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const res = await fetch(`/api/recipes?userId=${encodeURIComponent(userId ?? "")}`);
      if (!res.ok) {
        throw new Error("Failed to fetch recipes");
      }
      return res.json() as Promise<{ items: Array<Record<string, unknown>> }>;
    },
  });
}

export function useRecipeDetailQuery(userId: string | null, recipeId: string | null) {
  return useQuery({
    queryKey: ["recipe", userId, recipeId],
    enabled: Boolean(userId && recipeId),
    queryFn: async () => {
      const res = await fetch(
        `/api/recipes/${recipeId}?userId=${encodeURIComponent(userId ?? "")}`,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch recipe details");
      }
      return res.json() as Promise<{ recipe: Record<string, unknown>; lines: Array<Record<string, unknown>> }>;
    },
  });
}

export function useCreateRecipeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RecipeInput) => {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to create recipe");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useUpdateRecipeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipeId,
      payload,
    }: {
      recipeId: string;
      payload: Partial<RecipeInput> & { userId: string; isArchived?: boolean };
    }) => {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to update recipe");
      }
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe", vars.payload.userId, vars.recipeId] });
    },
  });
}

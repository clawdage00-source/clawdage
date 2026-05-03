"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type BatchInput = {
  userId: string;
  recipeId: string;
  expectedYield?: number;
  notes?: string;
};

export function useBatchesQuery(userId: string | null) {
  return useQuery({
    queryKey: ["batches", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const res = await fetch(`/api/batches?userId=${encodeURIComponent(userId ?? "")}`);
      if (!res.ok) {
        throw new Error("Failed to fetch batches");
      }
      return res.json() as Promise<{ items: Array<Record<string, unknown>> }>;
    },
  });
}

export function useCreateBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BatchInput) => {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to create batch");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

export function useCloseBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      batchId,
      payload,
    }: {
      batchId: string;
      payload: {
        userId: string;
        actualYield?: number;
        wasteQuantity?: number;
        notes?: string;
        status?: "completed" | "discarded";
      };
    }) => {
      const res = await fetch(`/api/batches/${batchId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to close batch");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

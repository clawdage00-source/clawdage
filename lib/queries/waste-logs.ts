"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type WasteLogInput = {
  userId: string;
  ingredientId: string;
  quantityWasted: number;
  reason: string;
  wasteDate: string;
};

export function useWasteLogsQuery(userId: string | null) {
  return useQuery({
    queryKey: ["waste-logs", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const res = await fetch(`/api/waste-logs?userId=${encodeURIComponent(userId ?? "")}`);
      if (!res.ok) {
        throw new Error("Failed to fetch waste logs");
      }
      return res.json() as Promise<{ items: Array<Record<string, unknown>> }>;
    },
  });
}

export function useCreateWasteLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: WasteLogInput) => {
      const res = await fetch("/api/waste-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to create waste log");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waste-logs"] });
    },
  });
}

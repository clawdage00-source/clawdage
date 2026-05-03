"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export type SampleDataSummary = {
  ok: boolean;
  ingredientsInserted: number;
  recipesInserted: number;
  menusInserted: number;
  menuItemsInserted: number;
  wasteLogsInserted: number;
};

export function useLoadSampleDataMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/sample-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<SampleDataSummary> & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load sample data");
      }
      return data as SampleDataSummary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.invalidateQueries({ queryKey: ["waste-logs"] });
    },
  });
}

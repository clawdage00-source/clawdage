"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 10;

export type WasteLogRow = {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantityWasted: string | number;
  reason: string;
  wasteDate: string;
};

type WasteLogsPage = {
  items: WasteLogRow[];
  totalCount: number;
  totalQuantityWasted: number;
  limit: number;
  offset: number;
};

type WasteLogInput = {
  userId: string;
  ingredientId: string;
  quantityWasted: number;
  reason: string;
  wasteDate: string;
};

export const wasteLogsInfiniteQueryKey = (userId: string | null) =>
  ["waste-logs", "infinite", userId, PAGE_SIZE] as const;

export function useWasteLogsInfiniteQuery(userId: string | null) {
  return useInfiniteQuery({
    queryKey: wasteLogsInfiniteQueryKey(userId),
    enabled: Boolean(userId),
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }): Promise<WasteLogsPage> => {
      const offset = pageParam as number;
      const params = new URLSearchParams({
        userId: userId ?? "",
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      const res = await fetch(`/api/waste-logs?${params.toString()}`, { signal });
      if (!res.ok) {
        throw new Error("Failed to fetch waste logs");
      }
      return res.json() as Promise<WasteLogsPage>;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0);
      if (loaded >= lastPage.totalCount) {
        return undefined;
      }
      return loaded;
    },
  });
}

export { PAGE_SIZE as WASTE_LOGS_PAGE_SIZE };

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

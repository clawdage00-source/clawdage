"use client";

import { useQuery } from "@tanstack/react-query";

export type UserKitchenResponse = {
  kitchenName: string | null;
};

export const userKitchenQueryKey = (userId: string | null) => ["user-kitchen", userId] as const;

export function useUserKitchenQuery(userId: string | null) {
  return useQuery({
    queryKey: userKitchenQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async ({ signal }): Promise<UserKitchenResponse> => {
      const response = await fetch(`/api/user/kitchen?userId=${encodeURIComponent(userId ?? "")}`, {
        signal,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch kitchen details");
      }
      return (await response.json()) as UserKitchenResponse;
    },
  });
}

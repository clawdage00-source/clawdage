"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthUserSerialized } from "@/lib/supabase-auth-user";

export default function KitchenOnboardingPage() {
  const router = useRouter();
  const [kitchenName, setKitchenName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      const user = await getAuthUserSerialized();
      if (!user) {
        router.replace("/login");
        return;
      }
      setLoading(false);
    }

    checkSession();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const user = await getAuthUserSerialized();

    if (!user) {
      router.replace("/login");
      return;
    }

    const res = await fetch("/api/onboarding/kitchen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        kitchenName,
        city,
        address,
      }),
    });

    if (!res.ok) {
      setError("Could not create kitchen. Please try again.");
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard");
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
      <div className="w-full max-w-[26rem]">
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Onboarding
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 md:text-[1.65rem] dark:text-zinc-50">
            First kitchen
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            This becomes the default kitchen for your account.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="kitchenName"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Kitchen name
            </label>
            <input
              id="kitchenName"
              name="kitchenName"
              value={kitchenName}
              onChange={(e) => setKitchenName(e.target.value)}
              required
              className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-950 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/[0.04] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
              placeholder="Downtown Cloud Kitchen"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="city"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              City
            </label>
            <input
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-950 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/[0.04] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
              placeholder="Chennai"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="min-h-24 w-full rounded-md border border-zinc-200 bg-white px-3.5 py-2.5 text-[15px] text-zinc-950 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/[0.04] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
              placeholder="Street, Area, Landmark"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {submitting ? "Creating…" : "Create kitchen"}
          </button>
        </form>
      </div>
    </div>
  );
}

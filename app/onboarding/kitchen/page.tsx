"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

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
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Loading your kitchen setup...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-black/[.08] bg-white px-8 py-10 shadow-sm dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Create your first kitchen
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This becomes the default kitchen for your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              className="h-11 w-full rounded-lg border border-black/[.08] bg-white px-3.5 text-base text-zinc-950 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/20"
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
              className="h-11 w-full rounded-lg border border-black/[.08] bg-white px-3.5 text-base text-zinc-950 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/20"
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
              className="min-h-24 w-full rounded-lg border border-black/[.08] bg-white px-3.5 py-2.5 text-base text-zinc-950 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/20"
              placeholder="Street, Area, Landmark"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create kitchen"}
          </button>
        </form>
      </div>
    </div>
  );
}

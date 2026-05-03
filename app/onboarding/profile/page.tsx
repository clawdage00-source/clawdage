"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthUserSerialized } from "@/lib/supabase-auth-user";

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
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

    const res = await fetch("/api/onboarding/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        fullName,
      }),
    });

    if (!res.ok) {
      setError("Could not save your profile. Please try again.");
      setSubmitting(false);
      return;
    }

    router.replace("/onboarding/kitchen");
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
            Your name
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            How should we address you in the product?
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-950 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/[0.04] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
              placeholder="Alex Quinn"
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
            {submitting ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase-client";

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const email = (
      form.elements.namedItem("email") as HTMLInputElement | null
    )?.value;

    if (!email) {
      setError("Please enter your email.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (otpError) {
        setError(otpError.message);
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      const isNetwork =
        err instanceof TypeError &&
        (err.message === "Failed to fetch" || err.message === "Load failed");
      setError(
        isNetwork
          ? "Could not reach Supabase. Confirm NEXT_PUBLIC_SUPABASE_URL (https://…supabase.co or your local API URL), that the project is up, and that nothing is blocking the request."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Try again.",
      );
      setIsSubmitting(false);
      return;
    }

    setInfo("Magic link sent. Check your email and open the link.");
    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-950 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/[0.04] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
          placeholder="you@example.com"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{info}</p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {isSubmitting ? "Sending link…" : "Continue with email"}
      </button>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        We&apos;ll send a magic sign-in link to your email.
      </p>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/"
          className="font-medium text-zinc-950 underline-offset-2 hover:underline dark:text-zinc-50"
        >
          Back to home
        </Link>
      </p>
    </form>
  );
}

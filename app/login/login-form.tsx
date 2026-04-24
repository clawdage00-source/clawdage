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

    setInfo("Magic link sent. Check your email and open the link.");
    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-5"
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
          className="h-11 w-full rounded-lg border border-black/[.08] bg-white px-3.5 text-base text-zinc-950 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/20"
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
        className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:opacity-90"
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

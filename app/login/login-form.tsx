"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // Wire to your auth provider or API route when ready
    setTimeout(() => setIsSubmitting(false), 400);
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
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Password
          </label>
          <button
            type="button"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            Forgot password?
          </button>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 w-full rounded-lg border border-black/[.08] bg-white px-3.5 text-base text-zinc-950 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/20"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:opacity-90"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
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

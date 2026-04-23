"use client";

import Link from "next/link";
import { useState } from "react";

export function SignupForm() {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const confirm = (
      form.elements.namedItem("confirmPassword") as HTMLInputElement
    ).value;
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      // Wire up sign-up (e.g. server action or API) when ready.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-5"
      noValidate
    >
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-[box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          placeholder="Alex Quinn"
        />
      </div>
      <div className="space-y-2">
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
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-[box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-[box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          placeholder="At least 8 characters"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-[box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          placeholder="Repeat your password"
        />
      </div>
      {formError ? (
        <p
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {formError}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:opacity-90"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/"
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          Back to home
        </Link>
      </p>
    </form>
  );
}

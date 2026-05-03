import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a new account",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
      <div className="w-full max-w-[26rem]">
        <header className="mb-10 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Account
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 md:text-[1.65rem] dark:text-zinc-50">
            Create an account
          </h1>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            A few details to get your workspace ready.
          </p>
        </header>
        <SignupForm />
      </div>
    </div>
  );
}

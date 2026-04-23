import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a new account",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your details to get started
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}

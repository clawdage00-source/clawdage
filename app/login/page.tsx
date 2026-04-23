import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-black/[.08] bg-white px-8 py-10 shadow-sm dark:border-white/[.145] dark:bg-zinc-950">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your credentials to continue.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

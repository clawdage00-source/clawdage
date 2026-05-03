import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with magic link",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
      <div className="w-full max-w-[26rem]">
        <header className="mb-10 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Sign in
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 md:text-[1.65rem] dark:text-zinc-50">
            Welcome back
          </h1>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            We&apos;ll email you a secure magic link—no password to remember.
          </p>
        </header>
        <LoginForm />
      </div>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-xl rounded-2xl border border-black/[.08] bg-white px-8 py-10 shadow-sm dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Clawdage
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Inventory and kitchen operations for cloud kitchens.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            Sign in with email
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/[.08] px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-100 dark:hover:bg-[#1a1a1a]"
          >
            Open dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

import type { ReactNode } from "react";

/** Shared field styling for dashboard forms */
export const dashboardFieldClass =
  "h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/[0.04]";

export const dashboardFieldMultilineClass =
  "min-h-24 w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/[0.04]";

export function DashboardPrimaryButton({
  children,
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DashboardStat({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="text-left md:text-right">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900">
        {value}
      </p>
    </div>
  );
}

type DashboardShellProps = {
  title: string;
  description?: string;
  /** Right side of header — stats, actions */
  meta?: ReactNode;
  children: ReactNode;
};

export function DashboardShell({
  title,
  description,
  meta,
  children,
}: DashboardShellProps) {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-col gap-6 border-b border-zinc-200 pb-8 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-[1.75rem] md:leading-snug">
              {title}
            </h1>
            {description ? (
              <p className="max-w-2xl text-[15px] leading-relaxed text-zinc-600">
                {description}
              </p>
            ) : null}
          </div>
          {meta ? <div className="shrink-0">{meta}</div> : null}
        </header>
        <div className="pt-8">{children}</div>
      </div>
    </main>
  );
}

export function DashboardSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
      {children}
    </h2>
  );
}

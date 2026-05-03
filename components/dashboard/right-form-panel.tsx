"use client";

import { useEffect, type ReactNode } from "react";

type RightFormPanelProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function RightFormPanel({ open, title, onClose, children }: RightFormPanelProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-zinc-900/25 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl sm:max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-right-panel-title"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <h2 id="dashboard-right-panel-title" className="text-lg font-semibold tracking-tight text-zinc-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <span className="sr-only">Close</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
      </aside>
    </div>
  );
}

export const panelLabelClass = "block text-sm font-medium text-zinc-800";
export const panelFieldStackClass = "space-y-1.5";

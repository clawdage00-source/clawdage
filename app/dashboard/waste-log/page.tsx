"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getAuthUserSerialized } from "@/lib/supabase-auth-user";
import { useIngredientsQuery } from "@/lib/queries/ingredients";
import {
  useCreateWasteLogMutation,
  useWasteLogsInfiniteQuery,
  WASTE_LOGS_PAGE_SIZE,
} from "@/lib/queries/waste-logs";
import {
  DashboardPrimaryButton,
  DashboardSectionTitle,
  DashboardShell,
  DashboardStat,
  dashboardFieldClass,
} from "@/components/dashboard/page-shell";
import { panelLabelClass, panelFieldStackClass, RightFormPanel } from "@/components/dashboard/right-form-panel";

const toolbarBtn =
  "inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50";

export default function WasteLogPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [ingredientId, setIngredientId] = useState("");
  const [quantityWasted, setQuantityWasted] = useState("");
  const [reason, setReason] = useState("");
  const [wasteDate, setWasteDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadUser() {
      const user = await getAuthUserSerialized();
      setUserId(user?.id ?? null);
    }
    loadUser();
  }, []);

  const ingredientsQuery = useIngredientsQuery(userId, "", false);
  const wasteLogsQuery = useWasteLogsInfiniteQuery(userId);
  const createWasteLog = useCreateWasteLogMutation();
  const wasteLogsQueryRef = useRef(wasteLogsQuery);
  wasteLogsQueryRef.current = wasteLogsQuery;

  const flatItems = useMemo(
    () => wasteLogsQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [wasteLogsQuery.data?.pages],
  );

  const totalQuantityWasted = wasteLogsQuery.data?.pages[0]?.totalQuantityWasted ?? 0;
  const totalCount = wasteLogsQuery.data?.pages[0]?.totalCount ?? 0;

  useEffect(() => {
    const el = loadMoreSentinelRef.current;
    if (!el || !userId) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) {
          return;
        }
        const q = wasteLogsQueryRef.current;
        if (q.hasNextPage && !q.isFetchingNextPage) {
          void q.fetchNextPage();
        }
      },
      { root: null, rootMargin: "120px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [userId, totalCount]);

  function openPanel() {
    setIngredientId("");
    setQuantityWasted("");
    setReason("");
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setWasteDate(`${y}-${m}-${day}`);
    setErrorMessage(null);
    setPanelOpen(true);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setErrorMessage("Please sign in again.");
      return;
    }
    setErrorMessage(null);
    try {
      await createWasteLog.mutateAsync({
        userId,
        ingredientId,
        quantityWasted: Number(quantityWasted),
        reason,
        wasteDate,
      });
      setPanelOpen(false);
    } catch {
      setErrorMessage("Could not save waste log.");
    }
  }

  return (
    <>
      <DashboardShell
        title="Waste log"
        description="Record ingredient waste with quantity, reason, and date. History loads in batches as you scroll."
        meta={<DashboardStat label="Total logged" value={totalQuantityWasted.toFixed(2)} />}
      >
        <div className="space-y-10">
          <button type="button" onClick={openPanel} className={toolbarBtn}>
            Log waste entry
          </button>

          {wasteLogsQuery.isLoading ? <p className="text-sm text-zinc-500">Loading…</p> : null}
          {wasteLogsQuery.isError ? (
            <p className="text-sm text-red-600">Failed to load waste logs.</p>
          ) : null}
          {!wasteLogsQuery.isLoading &&
          !wasteLogsQuery.isError &&
          totalCount === 0 ? (
            <p className="text-sm text-zinc-500">No entries yet.</p>
          ) : null}

          {!wasteLogsQuery.isLoading && !wasteLogsQuery.isError && flatItems.length > 0 ? (
            <section>
              <DashboardSectionTitle>History</DashboardSectionTitle>
              <p className="mt-2 text-xs text-zinc-500">
                Showing {flatItems.length} of {totalCount} — loads {WASTE_LOGS_PAGE_SIZE} more when you scroll near the
                bottom.
              </p>
              <ul className="mt-4 divide-y divide-zinc-200 border-t border-zinc-200">
                {flatItems.map((item) => (
                  <li
                    key={String(item.id)}
                    className="flex flex-col gap-2 py-5 first:pt-4 sm:flex-row sm:items-baseline sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-[15px] font-medium text-zinc-900">{String(item.ingredientName)}</p>
                      <p className="text-sm text-zinc-600">
                        {String(item.quantityWasted)} wasted
                        <span className="text-zinc-400"> · </span>
                        {String(item.reason)}
                      </p>
                    </div>
                    <time className="shrink-0 text-sm tabular-nums text-zinc-500">
                      {String(item.wasteDate).slice(0, 10)}
                    </time>
                  </li>
                ))}
              </ul>

              <div ref={loadMoreSentinelRef} className="h-4 w-full" aria-hidden />

              {wasteLogsQuery.isFetchingNextPage ? (
                <p className="mt-3 text-center text-sm text-zinc-500">Loading more…</p>
              ) : null}
              {!wasteLogsQuery.hasNextPage && flatItems.length > 0 ? (
                <p className="mt-3 text-center text-xs text-zinc-400">All entries loaded</p>
              ) : null}
            </section>
          ) : null}
        </div>
      </DashboardShell>

      <RightFormPanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Log waste">
        <form onSubmit={handleCreate} className="space-y-5">
          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className={panelFieldStackClass}>
            <label htmlFor="waste-ing" className={panelLabelClass}>
              Ingredient
            </label>
            <select
              id="waste-ing"
              required
              value={ingredientId}
              onChange={(event) => setIngredientId(event.target.value)}
              className={dashboardFieldClass}
            >
              <option value="">Select ingredient</option>
              {ingredientsQuery.data?.items.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
            </select>
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="waste-qty" className={panelLabelClass}>
              Quantity wasted
            </label>
            <input
              id="waste-qty"
              required
              value={quantityWasted}
              onChange={(event) => setQuantityWasted(event.target.value)}
              className={dashboardFieldClass}
            />
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="waste-reason" className={panelLabelClass}>
              Reason
            </label>
            <input
              id="waste-reason"
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className={dashboardFieldClass}
            />
          </div>
          <div className={panelFieldStackClass}>
            <label htmlFor="waste-date" className={panelLabelClass}>
              Date
            </label>
            <input
              id="waste-date"
              required
              type="date"
              value={wasteDate}
              onChange={(event) => setWasteDate(event.target.value)}
              className={dashboardFieldClass}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <DashboardPrimaryButton type="submit" disabled={createWasteLog.isPending}>
              {createWasteLog.isPending ? "Saving…" : "Save entry"}
            </DashboardPrimaryButton>
            <button type="button" onClick={() => setPanelOpen(false)} className={toolbarBtn}>
              Cancel
            </button>
          </div>
        </form>
      </RightFormPanel>
    </>
  );
}

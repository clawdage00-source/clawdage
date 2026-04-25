"use client";

import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useUserKitchenQuery } from "@/lib/queries/user-kitchen";

type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string;
  children?: Array<{ id: string; label: string }>;
};

type DropPosition = "before" | "after";

function Icon({
  path,
  className = "h-5 w-5",
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [activeChild, setActiveChild] = useState("ingredients-list");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: DropPosition } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? null);
    }

    loadUser();
  }, [router]);

  const {
    data: kitchenData,
    isLoading: isKitchenLoading,
    isError: isKitchenError,
    error: kitchenError,
  } = useUserKitchenQuery(userId);

  const kitchenName = kitchenData?.kitchenName?.trim() || "My Kitchen";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!userMenuRef.current) {
        return;
      }
      if (!userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const dashboardItem: NavItem = {
    id: "dashboard",
    label: "Dashboard",
    icon: <Icon path="M3 12h8V3H3v9Zm10 9h8v-6h-8v6Zm0-10h8V3h-8v8ZM3 21h8v-6H3v6Z" />,
  };

  const [reorderableItems, setReorderableItems] = useState<NavItem[]>([
    {
      id: "ingredients",
      label: "Ingredients",
      icon: <Icon path="M4 6h16M4 12h16M4 18h10" />,
      children: [
        { id: "ingredients-list", label: "List" },
        { id: "ingredients-batches", label: "Batches" },
      ],
    },
    {
      id: "sales",
      label: "Sales",
      icon: <Icon path="M4 18V7a2 2 0 0 1 2-2h12M4 18h16M9 10h6M9 14h3" />,
    },
    {
      id: "recipe",
      label: "Recipe",
      icon: <Icon path="M6 4h9l3 3v13H6zM15 4v3h3M9 12h6M9 16h4" />,
    },
    {
      id: "wastelog",
      label: "Waste Log",
      icon: <Icon path="M8 6h8M6 9h12l-1 10H7L6 9Zm3-3h6" />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <Icon path="M5 19V9m7 10V5m7 14v-7M3 19h18" />,
    },
    {
      id: "forecast",
      label: "Forecast",
      icon: <Icon path="M4 16l5-5 4 4 7-8M20 7h-5" />,
    },
  ]);

  const navItems: NavItem[] = [dashboardItem, ...reorderableItems];

  const expanded = isMobileOpen || isPinnedOpen || isHoverOpen;

  const sidebarClassName = `flex h-full flex-col rounded-[2rem] bg-white/55 supports-[backdrop-filter]:bg-white/45 backdrop-blur-xl border border-white/40 shadow-[0_14px_34px_rgba(0,0,0,0.10)] transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
    expanded ? "w-72" : "w-20"
  }`;

  function moveItem(draggedId: string, targetId: string, position: DropPosition) {
    setReorderableItems((prev) => {
      const draggedIndex = prev.findIndex((item) => item.id === draggedId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        return prev;
      }

      const updated = [...prev];
      const [movedItem] = updated.splice(draggedIndex, 1);
      const destinationIndex = updated.findIndex((item) => item.id === targetId);
      if (destinationIndex === -1) {
        return prev;
      }
      const insertIndex = position === "before" ? destinationIndex : destinationIndex + 1;
      updated.splice(insertIndex, 0, movedItem);
      return updated;
    });
  }

  function renderNavItem(item: NavItem) {
    const isActiveParent = activeItem === item.id;
    const showChildren = expanded && !!item.children;
    const isReorderable = item.id !== "dashboard";

    return (
      <li
        key={item.id}
        className={`w-full transition-opacity ${draggedItemId === item.id ? "opacity-70" : "opacity-100"}`}
        draggable={isReorderable}
        onDragStart={(event: DragEvent<HTMLLIElement>) => {
          if (!isReorderable) {
            return;
          }
          setDraggedItemId(item.id);
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", item.id);
        }}
        onDragOver={(event: DragEvent<HTMLLIElement>) => {
          if (!isReorderable) {
            return;
          }
          const draggedId = event.dataTransfer.getData("text/plain") || draggedItemId;
          if (!draggedId || draggedId === item.id || draggedId === "dashboard") {
            setDropTarget(null);
            return;
          }
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          const bounds = event.currentTarget.getBoundingClientRect();
          const position: DropPosition =
            event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
          setDropTarget({ id: item.id, position });
        }}
        onDrop={(event: DragEvent<HTMLLIElement>) => {
          if (!isReorderable) {
            return;
          }
          event.preventDefault();
          const draggedId = event.dataTransfer.getData("text/plain") || draggedItemId;
          const dropPosition = dropTarget?.id === item.id ? dropTarget.position : "before";
          if (!draggedId || draggedId === item.id || draggedId === "dashboard") {
            setDraggedItemId(null);
            setDropTarget(null);
            return;
          }
          moveItem(draggedId, item.id, dropPosition);
          setDraggedItemId(null);
          setDropTarget(null);
        }}
        onDragLeave={(event: DragEvent<HTMLLIElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDropTarget((prev) => (prev?.id === item.id ? null : prev));
          }
        }}
        onDragEnd={() => {
          setDraggedItemId(null);
          setDropTarget(null);
        }}
      >
        {dropTarget?.id === item.id && dropTarget.position === "before" ? (
          <div className="mb-1.5">
            <div className="flex h-[52px] items-center rounded-2xl border border-[#261FFF]/30 bg-gradient-to-r from-[#261FFF]/12 via-[#261FFF]/8 to-transparent px-3">
              <span className="h-8 w-8 rounded-xl border border-[#261FFF]/35 bg-white/70" />
              {expanded ? (
                <>
                  <span className="ml-2 h-3 w-28 rounded-full bg-[#261FFF]/30" />
                  <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.16em] text-[#261FFF]/80">
                    Drop
                  </span>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setActiveItem(item.id)}
          className={`group flex w-full items-center rounded-2xl py-2 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#261FFF] focus-visible:ring-offset-2 ${
            expanded ? "justify-start px-3" : "justify-center px-0"
          } ${
            isActiveParent
              ? "bg-black text-white shadow-sm"
              : "text-black hover:bg-zinc-100"
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            {item.icon}
          </span>
          {expanded ? (
            <>
              <span className="ml-2 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span
                  className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                    isActiveParent ? "bg-white text-black" : "bg-black text-white"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
              {isReorderable ? (
                <span className="ml-2 text-xs text-zinc-400" aria-hidden="true">
                  ::
                </span>
              ) : null}
            </>
          ) : null}
        </button>
        {dropTarget?.id === item.id && dropTarget.position === "after" ? (
          <div className="mt-1.5">
            <div className="flex h-[52px] items-center rounded-2xl border border-[#261FFF]/30 bg-gradient-to-r from-[#261FFF]/12 via-[#261FFF]/8 to-transparent px-3">
              <span className="h-8 w-8 rounded-xl border border-[#261FFF]/35 bg-white/70" />
              {expanded ? (
                <>
                  <span className="ml-2 h-3 w-28 rounded-full bg-[#261FFF]/30" />
                  <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.16em] text-[#261FFF]/80">
                    Drop
                  </span>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {showChildren ? (
          <ul className="mt-2 space-y-1 border-l border-zinc-200 pl-6">
            {item.children?.map((child) => {
              const isChildActive = activeChild === child.id;
              return (
                <li key={child.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveItem(item.id);
                      setActiveChild(child.id);
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#261FFF] focus-visible:ring-offset-2 ${
                      isChildActive
                        ? "bg-zinc-100 font-semibold text-black"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                    }`}
                  >
                    {child.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#eef0f5_50%,_#e8ebf3_100%)] text-black">
      <aside className="hidden p-3 md:block">
        <div
          className={sidebarClassName}
          onMouseEnter={() => setIsHoverOpen(true)}
          onMouseLeave={() => setIsHoverOpen(false)}
        >
          <div className="flex h-full flex-col gap-3 rounded-[2rem] border border-white/50 bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_26px_rgba(0,0,0,0.10)] supports-[backdrop-filter]:bg-white/72 supports-[backdrop-filter]:backdrop-blur-xl">
            <div className="flex min-h-10 items-center gap-2 px-1 pt-1">
              {expanded ? (
                <button
                  type="button"
                  onClick={() => setIsPinnedOpen((prev) => !prev)}
                  className="ml-auto rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#261FFF]"
                  aria-label={isPinnedOpen ? "Unpin sidebar" : "Pin sidebar"}
                >
                  <Icon
                    path={isPinnedOpen ? "M6 3h12l-4 7v6l-4-2v-4L6 3Z" : "M6 3h12l-4 7v6l-4-2v-4L6 3Zm6 13v5"}
                    className="h-4 w-4"
                  />
                </button>
              ) : null}
            </div>

            <nav aria-label="Sidebar navigation" className="flex-1 overflow-y-auto pr-1">
              <ul className="space-y-1.5">{navItems.map(renderNavItem)}</ul>
            </nav>

            <div className="mt-8 border-t border-zinc-200 pt-3">
              <button
                type="button"
                className="flex w-full items-center rounded-2xl px-3 py-2 text-sm text-black transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#261FFF] focus-visible:ring-offset-2"
              >
                <span className="flex h-9 w-9 items-center justify-center">
                  <Icon path="M12 3v3m0 12v3m9-9h-3M6 12H3m14.4 6.4-2.1-2.1M8.7 8.7 6.6 6.6m10.8 0-2.1 2.1M8.7 15.3l-2.1 2.1" />
                </span>
                {expanded ? <span className="ml-2">Settings</span> : null}
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-2 flex w-full items-center rounded-2xl px-3 py-2 text-sm text-black transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#261FFF] focus-visible:ring-offset-2"
              >
                <span className="flex h-9 w-9 items-center justify-center">
                  <Icon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 13 5-4-5-4M21 12H9" />
                </span>
                {expanded ? <span className="ml-2">Logout</span> : null}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="relative z-30 mx-3 mt-3 rounded-2xl border border-white/55 bg-white/82 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_24px_rgba(15,23,42,0.10)] supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-2xl md:mx-6 md:mt-6 md:px-6">
          <div className="flex flex-wrap items-center gap-3 md:grid md:grid-cols-[auto_1fr_auto] md:gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="rounded-xl border border-black/10 px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#261FFF] md:hidden"
            >
              {isMobileOpen ? "Close Menu" : "Open Menu"}
            </button>

            <div className="hidden items-center rounded-xl bg-zinc-50 px-3 py-2 md:flex">
              <span className="text-xl font-semibold text-black">Dashboard</span>
            </div>

            <label className="group flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 transition-colors focus-within:border-[#261FFF] focus-within:bg-white md:w-full md:max-w-md md:justify-self-center">
              <Icon path="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" className="h-4 w-4 text-zinc-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm text-black placeholder:text-zinc-500 focus:outline-none"
                aria-label="Global search"
              />
            </label>

            <div className="ml-auto flex items-center gap-2 md:ml-0 md:justify-self-end">
              <button
                type="button"
                className="relative rounded-xl border border-zinc-200 bg-white p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#261FFF]"
                aria-label="Refresh data"
              >
                <Icon path="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="relative rounded-xl border border-zinc-200 bg-white p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#261FFF]"
                aria-label="Notifications"
              >
                <Icon path="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  4
                </span>
              </button>

              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 py-1.5 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#261FFF]"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#261FFF] to-blue-300 text-xs font-semibold text-white">
                    {kitchenName.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[150px] truncate text-sm font-semibold md:inline">
                    {kitchenName}
                  </span>
                  <Icon path="m6 9 6 6 6-6" className="h-4 w-4 text-zinc-500" />
                </button>

                {isUserMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-black/10 bg-white p-2 shadow-[0_14px_36px_rgba(0,0,0,0.14)]"
                  >
                    <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-zinc-100" role="menuitem">
                      <Icon path="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" className="h-4 w-4" />
                      Profile
                    </button>
                    <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-zinc-100" role="menuitem">
                      <Icon path="M12 3v3m0 12v3m9-9h-3M6 12H3m14.4 6.4-2.1-2.1M8.7 8.7 6.6 6.6m10.8 0-2.1 2.1M8.7 15.3l-2.1 2.1" className="h-4 w-4" />
                      Settings
                    </button>
                    <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-zinc-100" role="menuitem">
                      <Icon path="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Zm0-14v4m0 4h.01" className="h-4 w-4" />
                      Help & Support
                    </button>
                    <div className="my-1 border-t border-zinc-200" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      <Icon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 13 5-4-5-4M21 12H9" className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

        </header>

        {isMobileOpen ? (
          <aside className="border-b border-black/10 bg-white p-3 md:hidden">
            <div className="space-y-2">
              <ul className="space-y-2">{navItems.map(renderNavItem)}</ul>
              <button
                type="button"
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm hover:bg-zinc-100"
              >
                <span className="mr-2">
                  <Icon path="M12 3v3m0 12v3m9-9h-3M6 12H3m14.4 6.4-2.1-2.1M8.7 8.7 6.6 6.6m10.8 0-2.1 2.1M8.7 15.3l-2.1 2.1" />
                </span>
                Settings
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm hover:bg-zinc-100"
              >
                <span className="mr-2">
                  <Icon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 13 5-4-5-4M21 12H9" />
                </span>
                Logout
              </button>
            </div>
          </aside>
        ) : null}

        <main className="flex-1 p-4 md:p-6">
          <div className="rounded-3xl border border-white/50 bg-white/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_34px_rgba(0,0,0,0.09)] supports-[backdrop-filter]:bg-white/72 supports-[backdrop-filter]:backdrop-blur-lg md:p-8">
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
              Welcome back {email ?? "there"}.
              {" "}
              Navigate through modules from the expandable menu to manage inventory, sales, and forecasting.
            </p>
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
              <p className="font-semibold text-zinc-900">User Kitchen API (TanStack Query)</p>
              <p className="mt-1">
                Status:{" "}
                {isKitchenLoading ? "Loading..." : isKitchenError ? "Error" : kitchenData ? "Success" : "Idle"}
              </p>
              <p className="mt-1 break-all">
                Data:{" "}
                {kitchenData ? JSON.stringify(kitchenData) : "No data yet"}
              </p>
              {isKitchenError ? (
                <p className="mt-1 text-red-600">
                  Error: {kitchenError instanceof Error ? kitchenError.message : "Unknown error"}
                </p>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

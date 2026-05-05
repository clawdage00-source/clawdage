"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { supabase } from "@/lib/supabase-client";
import { useUserKitchenQuery } from "@/lib/queries/user-kitchen";

type DashboardLayoutProps = {
  children: ReactNode;
};

type NavItem = {
  id: string;
  label: string;
  href?: string;
  icon: ReactNode;
  badge?: string;
  children?: Array<{ id: string; label: string; href: string }>;
};

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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // NEW STATES FOR GOOGLE DATA
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Still fetching kitchen data if needed for other parts
  const { data: kitchenData } = useUserKitchenQuery(userId);

  useEffect(() => {
    async function loadUser() {
      // Fetch user from Supabase to get Google Metadata
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? null);
      
      // GET GOOGLE DATA FROM METADATA
      setFullName(user.user_metadata?.full_name || "User");
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }

    loadUser();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // --- NAVIGATION ITEMS ---
  const dashboardItem: NavItem = {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: <Icon path="M3 12h8V3H3v9Zm10 9h8v-6h-8v6Zm0-10h8V3h-8v8ZM3 21h8v-6H3v6Z" />,
  };

  const [reorderableItems, setReorderableItems] = useState<NavItem[]>([
    {
      id: "ingredients",
      label: "Ingredients",
      href: "/dashboard/ingredients",
      icon: <Icon path="M4 6h16M4 12h16M4 18h10" />,
      children: [
        { id: "ingredients-list", label: "List", href: "/dashboard/ingredients" },
        { id: "ingredients-batches", label: "Batches", href: "/dashboard/ingredients/batches" },
      ],
    },
    {
      id: "recipe",
      label: "Recipe",
      href: "/dashboard/recipes",
      icon: <Icon path="M6 4h9l3 3v13H6zM15 4v3h3M9 12h6M9 16h4" />,
    },
    {
      id: "menus",
      label: "Menus",
      href: "/dashboard/menus",
      icon: <Icon path="M4 18V7a2 2 0 0 1 2-2h12M4 18h16M9 10h6M9 14h3" />,
    },
    {
      id: "wastelog",
      label: "Waste Log",
      href: "/dashboard/waste-log",
      icon: <Icon path="M8 6h8M6 9h12l-1 10H7L6 9Zm3-3h6" />,
    },
  ]);

  const navItems: NavItem[] = [dashboardItem, ...reorderableItems];
  const expanded = isMobileOpen || isPinnedOpen || isHoverOpen;

  const sidebarClassName = `flex h-full flex-col border-r border-zinc-200 bg-white transition-[width] duration-300 ease-out ${
    expanded ? "w-64" : "w-[4.5rem]"
  }`;

  function moveItem(draggedId: string, targetId: string) {
    setReorderableItems((prev) => {
      const draggedIndex = prev.findIndex((item) => item.id === draggedId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return prev;
      const updated = [...prev];
      const [movedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      return updated;
    });
  }

  function renderNavItem(item: NavItem) {
    const isActiveParent = item.href ? pathname === item.href : pathname.includes(item.id);
    const showChildren = expanded && !!item.children;
    const isReorderable = item.id !== "dashboard";

    return (
      <li key={item.id} className={`w-full transition-opacity ${draggedItemId === item.id ? "opacity-70" : "opacity-100"}`}>
        <Link
          href={item.href ?? "#"}
          className={`group flex w-full items-center rounded-md py-2 text-left text-sm font-medium transition-colors duration-150 ${
            expanded ? "justify-start px-2.5" : "justify-center px-0"
          } ${isActiveParent ? "bg-zinc-100 text-zinc-900" : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">{item.icon}</span>
          {expanded && <span className="ml-2 flex-1 truncate">{item.label}</span>}
        </Link>
      </li>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      {/* SIDEBAR */}
      <aside className="sticky top-0 hidden h-svh shrink-0 md:block">
        <div className={sidebarClassName} onMouseEnter={() => setIsHoverOpen(true)} onMouseLeave={() => setIsHoverOpen(false)}>
          <div className="flex h-full flex-col gap-1 px-2 py-5">
             <nav className="flex-1 overflow-y-auto pr-1"><ul className="space-y-1.5">{navItems.map(renderNavItem)}</ul></nav>
             <button onClick={handleSignOut} className="flex w-full items-center rounded-md px-2.5 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
               <span className="flex h-9 w-9 items-center justify-center"><Icon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 13 5-4-5-4M21 12H9" /></span>
               {expanded && <span className="ml-2">Logout</span>}
             </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 bg-transparent">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 md:gap-5 md:px-6 md:py-3.5">
            <div className="hidden shrink-0 items-center md:flex">
              <span className="text-[15px] font-semibold tracking-tight text-zinc-900">Operations</span>
            </div>

            {/* SEARCH BAR */}
            <label className="flex min-w-0 w-full max-w-md flex-1 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2 md:flex-initial">
              <Icon path="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" className="h-4 w-4 shrink-0 text-zinc-500" />
              <input placeholder="Search" className="min-w-0 w-full bg-transparent text-sm focus:outline-none" />
            </label>

            {/* USER PROFILE */}
            <div className="flex shrink-0 items-center">
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-expanded={isUserMenuOpen}
                  aria-label={fullName ? `Account menu, ${fullName}` : "Account menu"}
                  className="group flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1.5 pl-1.5 pr-1.5 shadow-none transition-colors hover:bg-zinc-50 md:gap-2.5 md:pr-2"
                >
                  <div className="shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-900">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-white">
                          {fullName?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="hidden min-w-0 truncate text-sm font-semibold md:inline">
                    {fullName}
                  </span>

                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 transition-colors group-hover:border-zinc-300 group-hover:bg-zinc-100"
                    aria-hidden={true}
                  >
                    <Icon
                      path="m6 9 6 6 6-6"
                      className={`h-4 w-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
                    <div className="px-3 py-2 text-xs text-zinc-500">{email}</div>
                    <div className="my-1 border-t border-zinc-200" />
                    <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Icon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 13 5-4-5-4M21 12H9" className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
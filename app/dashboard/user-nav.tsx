"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export function UserNav() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name || "User";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-2 py-1">
      {/* The Profile Picture */}
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-900">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
            {fullName.charAt(0)}
          </div>
        )}
      </div>

      {/* The Name */}
      <div className="hidden md:block text-right">
        <p className="text-sm font-semibold text-zinc-900 leading-none">
          {fullName}
        </p>
      </div>
      
      {/* Arrow Icon */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-zinc-400">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
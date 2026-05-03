"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthUserSerialized } from "@/lib/supabase-auth-user";
import { supabase } from "@/lib/supabase-client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying your magic link…");

  useEffect(() => {
    async function completeAuth() {
      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const user = await getAuthUserSerialized();

      if (!user) {
        setMessage("Session not found. Please sign in again.");
        return;
      }

      const res = await fetch(`/api/onboarding/status?userId=${user.id}`);
      if (!res.ok) {
        setMessage("Unable to load account status. Please try again.");
        return;
      }

      const status = (await res.json()) as {
        hasProfile: boolean;
        hasKitchen: boolean;
      };

      if (!status.hasProfile) {
        router.replace("/onboarding/profile");
        return;
      }

      if (!status.hasKitchen) {
        router.replace("/onboarding/kitchen");
        return;
      }

      router.replace("/dashboard");
    }

    completeAuth();
  }, [router, searchParams]);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
      <p className="text-[15px] text-zinc-600 dark:text-zinc-400">{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
          <p className="text-[15px] text-zinc-600 dark:text-zinc-400">Loading…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

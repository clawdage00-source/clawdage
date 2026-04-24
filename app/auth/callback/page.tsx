"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying your magic link...");

  useEffect(() => {
    async function completeAuth() {
      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Session not found. Please try sign in again.");
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
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{message}</p>
    </div>
  );
}

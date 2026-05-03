import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

/**
 * Supabase's browser client uses a storage lock around auth reads. Concurrent
 * `getUser()` calls (e.g. layout + page in React Strict Mode) can throw
 * "Lock ... was released because another request stole it". Queue reads so
 * only one runs at a time.
 */
let authReadTail: Promise<unknown> = Promise.resolve();

function enqueueAuthRead<T>(read: () => Promise<T>): Promise<T> {
  const run = authReadTail.then(read, read);
  authReadTail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function getAuthUserSerialized(): Promise<User | null> {
  return enqueueAuthRead(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return data.user ?? null;
  });
}

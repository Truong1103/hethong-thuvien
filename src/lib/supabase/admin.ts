import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

/** Chỉ dùng trên server (cron, tác vụ nền). Không import vào client. */
export function createSupabaseServiceRoleClient() {
  const url = getEnv().NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

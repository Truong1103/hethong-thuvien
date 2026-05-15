/**
 * OAuth redirect URL for Supabase `signInWithOAuth` (browser only).
 */
export function getOAuthCallbackUrl(nextPath: string): string {
  if (typeof window === "undefined") return "";
  const path =
    nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/books";
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(path)}`;
}

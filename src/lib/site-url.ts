import { headers } from "next/headers";

/** URL đầy đủ (https://...) cho in QR / chia sẻ. Ưu tiên NEXT_PUBLIC_SITE_URL khi deploy sau reverse proxy. */
export async function siteUrlForPath(path: string): Promise<string> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (base) return `${base}${normalized}`;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const forwardedProto = h.get("x-forwarded-proto");
  const proto =
    forwardedProto ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}${normalized}`;
}

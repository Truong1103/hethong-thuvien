"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Sau hydrate mới bật animation — tránh lệch SSR/client. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

/**
 * Chỉ đọc reduced motion sau hydrate.
 * Trên server / lần render đầu: coi như chưa biết → không dùng motion.
 */
export function useMotionEnabled() {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  return hydrated && !reduced;
}

/** `true` khi pathname đổi (chuyển trang), không tính lần render đầu. */
export function useIsRouteChange(pathname: string) {
  const prev = useRef(pathname);
  const isChange = prev.current !== pathname;
  useEffect(() => {
    prev.current = pathname;
  }, [pathname]);
  return isChange;
}

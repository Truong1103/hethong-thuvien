"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { PageTransition } from "./MotionPrimitives";
import { useHydrated, useIsRouteChange, useMotionEnabled } from "./useMotionConfig";

export function AnimatedMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const enabled = useMotionEnabled();
  const routeChange = useIsRouteChange(pathname);

  if (!hydrated || !enabled) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={pathname} routeChange={routeChange}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}

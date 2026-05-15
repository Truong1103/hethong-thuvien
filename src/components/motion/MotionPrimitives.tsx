"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import {
  defaultTransition,
  fadeIn,
  fadeUp,
  pageTransition,
  scaleIn,
  staggerContainer,
  staggerItem,
} from "@/lib/motion";
import { useHydrated, useMotionEnabled } from "./useMotionConfig";

type MotionDivProps = Omit<HTMLMotionProps<"div">, "children"> & { children: ReactNode };

/** HTML tĩnh — luôn hiển thị (SSR, reduced motion, hoặc trước hydrate). */
function useStaticMotion() {
  const hydrated = useHydrated();
  const enabled = useMotionEnabled();
  return !hydrated || !enabled;
}

export function FadeIn({ children, className, delay = 0, ...props }: MotionDivProps & { delay?: number }) {
  if (useStaticMotion()) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp({ children, className, delay = 0, ...props }: MotionDivProps & { delay?: number }) {
  if (useStaticMotion()) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className, delay = 0, ...props }: MotionDivProps & { delay?: number }) {
  if (useStaticMotion()) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionSection({
  children,
  className,
  delay = 0,
  immediate = false,
  ...props
}: MotionDivProps & { delay?: number; immediate?: boolean }) {
  if (useStaticMotion()) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: immediate ? 0.08 : 0.18,
        margin: immediate ? "0px 0px -8% 0px" : "-72px 0px -72px 0px",
      }}
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionCard({ children, className, ...props }: MotionDivProps) {
  if (useStaticMotion()) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={defaultTransition}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className, ...props }: MotionDivProps) {
  if (useStaticMotion()) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-64px", amount: 0.12 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, ...props }: MotionDivProps) {
  if (useStaticMotion()) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function PageTransition({
  children,
  className,
  routeChange,
}: {
  children: React.ReactNode;
  className?: string;
  routeChange?: boolean;
}) {
  if (useStaticMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageTransition}
      initial={routeChange ? "hidden" : false}
      animate="visible"
      exit="exit"
      transition={defaultTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  if (useStaticMotion()) {
    return <header className={className}>{children}</header>;
  }
  return (
    <motion.header
      className={className}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...defaultTransition, duration: 0.35 }}
    >
      {children}
    </motion.header>
  );
}

export function MotionFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  if (useStaticMotion()) {
    return <footer className={className}>{children}</footer>;
  }
  return (
    <motion.footer
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.footer>
  );
}

export { motion };

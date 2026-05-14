"use client";

import { useEffect, useRef } from "react";
import { incrementBookViewsAction } from "@/app/books/[id]/actions";

export function ViewIncrement({ bookId }: { bookId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void incrementBookViewsAction(bookId);
  }, [bookId]);
  return null;
}

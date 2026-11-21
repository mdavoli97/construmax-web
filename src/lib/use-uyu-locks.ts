"use client";

import { useEffect, useState } from "react";

export function useUyuLocks() {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/uyu-locks", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!cancelled && Array.isArray(body?.ids)) {
          setIds(new Set(body.ids));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return ids;
}

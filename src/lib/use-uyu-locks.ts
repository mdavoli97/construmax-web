"use client";

import { useEffect, useState } from "react";

export function useUyuLocks() {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/uyu-locks", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!cancelled && Array.isArray(body?.groupIds)) {
          setIds(new Set(body.groupIds));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return ids;
}

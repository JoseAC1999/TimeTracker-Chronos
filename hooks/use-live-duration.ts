"use client";

import { useEffect, useState } from "react";

import { getLiveDuration } from "@/lib/utils/time";

export function useLiveDuration(startedAt?: Date | string | null, accumulatedPauseSec = 0, isPaused = false) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!startedAt || isPaused) return;

    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isPaused, startedAt]);

  return startedAt ? getLiveDuration(startedAt, accumulatedPauseSec) : 0;
}

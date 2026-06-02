"use client";

import { useEffect, useState } from "react";

const INITIAL_RPS = 1247;
const INITIAL_SECONDS = 134;

export default function LiveTicker() {
  const [rps, setRps] = useState(INITIAL_RPS);
  const [seconds, setSeconds] = useState(INITIAL_SECONDS);

  useEffect(() => {
    const rpsId = setInterval(() => {
      setRps((prev) => {
        const delta = Math.round((Math.random() - 0.5) * 90);
        return Math.min(1400, Math.max(1100, prev + delta));
      });
    }, 1500);

    const secId = setInterval(() => setSeconds((s) => s + 1), 1000);

    return () => {
      clearInterval(rpsId);
      clearInterval(secId);
    };
  }, []);

  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;

  return (
    <div className="mt-16 flex items-center justify-center space-x-6 text-text-muted">
      <div className="flex items-center space-x-2 animate-metric-pulse">
        <div className="w-2 h-2 bg-velocity-blue rounded-full" />
        <span className="text-xs font-metrics tabular-nums">
          Live: Processing {rps.toLocaleString("en-US")} requests/sec
        </span>
      </div>
      <div className="w-1 h-[20px] bg-neutral-700/30" />
      <div className="flex items-center space-x-2">
        <span className="text-xs tabular-nums">
          Last optimized: {minutes}m {remSeconds}s ago
        </span>
      </div>
    </div>
  );
}

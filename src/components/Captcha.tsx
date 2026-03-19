"use client";

import { useCallback, useEffect, useState } from "react";

type TileName = "any" | "unknown" | "never";

type TypeTile = {
  id: number;
  name: TileName;
  color: string;
  description: string;
};

type Phase = "select" | "verifying" | "failure";

const TILE_POOL: Omit<TypeTile, "id">[] = [
  { name: "any", color: "#ef4444", description: "Accepts literally anything" },
  { name: "unknown", color: "#8b5cf6", description: "Must be narrowed first" },
  { name: "never", color: "#ec4899", description: "Represents impossibility" },
  { name: "any", color: "#ef4444", description: "Disables type checking" },
  { name: "unknown", color: "#8b5cf6", description: "Type-safe top type" },
  { name: "never", color: "#ec4899", description: "Bottom type, unreachable" },
  { name: "any", color: "#ef4444", description: "The forbidden keyword" },
  { name: "unknown", color: "#8b5cf6", description: "Requires type guard" },
  { name: "never", color: "#ec4899", description: "Exhaustiveness check" },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateTiles(): TypeTile[] {
  return shuffleArray(TILE_POOL).map((t, i) => ({ ...t, id: i }));
}

const FAILURE_MESSAGES = [
  "none of these are proper defined types",
  "any, unknown, and never are not 'proper defined types'",
  "these are escape hatches, not proper types",
  "proper types would be string, number, boolean, etc.",
  "you fell for the trap",
  "there are no proper defined types in this grid",
];

export default function Captcha() {
  const [tiles, setTiles] = useState<TypeTile[]>(
    () => TILE_POOL.map((t, i) => ({ ...t, id: i }))
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTiles(generateTiles());
  }, []);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<Phase>("select");
  const [failMessage, setFailMessage] = useState("");

  const handleTileClick = useCallback(
    (id: number) => {
      if (phase === "verifying") return;
      setPhase("select");
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [phase]
  );

  const handleVerify = useCallback(() => {
    setPhase("verifying");

    setTimeout(() => {
      setFailMessage(
        FAILURE_MESSAGES[Math.floor(Math.random() * FAILURE_MESSAGES.length)]
      );
      setPhase("failure");
    }, 1200);
  }, []);

  const handleRefresh = useCallback(() => {
    setTiles(generateTiles());
    setSelected(new Set());
    setPhase("select");
    setFailMessage("");
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto select-none">
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-sm border-2 border-neutral-500 flex items-center justify-center" />
              <span className="text-sm font-medium text-neutral-200">
                Verify you are human
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
              aria-label="Refresh challenge"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-4 py-3">
          <p className="text-sm text-neutral-300 text-center mb-1 font-medium">
            Select all fields that have proper defined types
          </p>
          <p className="text-[10px] text-neutral-500 text-center mb-3">
            ({selected.size} selected)
          </p>

          <div className="grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden">
            {tiles.map((tile) => {
              const isSelected = selected.has(tile.id);
              const isFailed =
                phase === "failure" && isSelected;

              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.id)}
                  className={`
                    relative aspect-square rounded-lg flex flex-col items-center justify-center gap-1 p-2
                    transition-all duration-200 border-2
                    ${
                      isFailed
                        ? "bg-red-900/60 border-red-400"
                        : isSelected
                        ? "bg-blue-900/60 border-blue-400"
                        : "bg-neutral-700/50 border-neutral-600 hover:border-neutral-400"
                    }
                  `}
                >
                  <span className="font-mono font-bold text-sm" style={{ color: tile.color }}>
                    {tile.name}
                  </span>
                  <span className="text-[9px] text-neutral-400 leading-tight text-center">
                    {tile.description}
                  </span>
                  {isSelected && phase === "select" && (
                    <div className="absolute top-1 right-1">
                      <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-4">
          {phase === "failure" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2 py-2 w-full bg-red-900/40 rounded-lg border border-red-700">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-red-300">
                  {failMessage}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                className="text-xs text-neutral-400 hover:text-neutral-200 underline transition-colors"
              >
                try again
              </button>
            </div>
          ) : (
            <button
              onClick={handleVerify}
              disabled={phase === "verifying"}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-60"
            >
              {phase === "verifying" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";

type TypeTile = {
  id: number;
  name: string;
  isValid: boolean;
  color: string;
  description: string;
};

type Challenge = {
  prompt: string;
  tiles: TypeTile[];
  correctIds: number[];
};

const FAKE_TYPES = [
  { name: "string", description: "Not any" },
  { name: "number", description: "Not any" },
  { name: "boolean", description: "Not any" },
  { name: "unknown", description: "Not any" },
  { name: "void", description: "Not any" },
  { name: "never", description: "Not any" },
  { name: "null", description: "Not any" },
  { name: "undefined", description: "Not any" },
  { name: "integer", description: "Not any" },
  { name: "float", description: "Not any" },
  { name: "symbol", description: "Not any" },
  { name: "bigint", description: "Not any" },
  { name: "object", description: "Not any" },
  { name: "char", description: "Not any" },
  { name: "byte", description: "Not any" },
  { name: "double", description: "Not any" },
  { name: "decimal", description: "Not any" },
  { name: "short", description: "Not any" },
  { name: "long", description: "Not any" },
  { name: "array", description: "Not any" },
  { name: "dict", description: "Not any" },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateChallenge(): Challenge {
  const shuffledFake = shuffleArray(FAKE_TYPES);

  const numAny = 3 + Math.floor(Math.random() * 3);
  const numFake = 9 - numAny;

  const anyTiles: TypeTile[] = Array.from({ length: numAny }, (_, i) => ({
    id: i,
    name: "any",
    isValid: true,
    color: "#ef4444",
    description: "Accepts any type",
  }));

  const fakeTiles: TypeTile[] = shuffledFake.slice(0, numFake).map((t, i) => ({
    id: numAny + i,
    name: t.name,
    isValid: false,
    color: "#6b7280",
    description: t.description,
  }));

  const tiles = shuffleArray([...anyTiles, ...fakeTiles]).map((t, i) => ({
    ...t,
    id: i,
  }));

  return {
    prompt: "Select all tiles containing: any",
    tiles,
    correctIds: tiles.filter((t) => t.isValid).map((t) => t.id),
  };
}

type Phase = "select" | "verifying" | "showAny" | "success" | "failure";

export default function Captcha() {
  const [challenge] = useState<Challenge>(() => generateChallenge());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<Phase>("select");

  const handleTileClick = useCallback(
    (id: number) => {
      if (phase === "verifying" || phase === "showAny" || phase === "success") return;
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
      const allCorrect =
        challenge.correctIds.every((id) => selected.has(id)) &&
        [...selected].every((id) => challenge.correctIds.includes(id));

      if (allCorrect) {
        setPhase("showAny");
      } else {
        setPhase("failure");
      }
    }, 1000);
  }, [challenge.correctIds, selected]);

  const handleConfirm = useCallback(() => {
    setPhase("success");
  }, []);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const visibleTiles =
    phase === "showAny"
      ? challenge.tiles.filter((t) => t.isValid)
      : challenge.tiles;

  return (
    <div className="w-full max-w-sm mx-auto select-none">
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors ${
                  phase === "success"
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-neutral-500"
                }`}
              >
                {phase === "success" && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
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
          <p className="text-sm text-neutral-300 text-center mb-3 font-mono">
            {phase === "showAny"
              ? "Showing only: any"
              : phase === "success"
              ? "Verified!"
              : challenge.prompt}
          </p>

          <div
            className={`grid gap-1.5 rounded-lg overflow-hidden ${
              visibleTiles.length <= 4 ? "grid-cols-2" : "grid-cols-3"
            }`}
          >
            {visibleTiles.map((tile) => {
              const isSelected = selected.has(tile.id);
              const isFiltered = phase === "showAny";
              const isRed = isFiltered;

              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.id)}
                  className={`
                    relative rounded-lg flex flex-col items-center justify-center gap-1 p-2
                    transition-all duration-200 border-2
                    ${isFiltered ? "aspect-auto py-3" : "aspect-square"}
                    ${
                      phase === "failure" && isSelected && !tile.isValid
                        ? "bg-red-900/60 border-red-400"
                        : phase === "failure" && !isSelected && tile.isValid
                        ? "bg-amber-900/40 border-amber-500"
                        : phase === "failure" && isSelected && tile.isValid
                        ? "bg-emerald-900/60 border-emerald-400"
                        : isRed
                        ? "bg-red-900/50 border-red-500"
                        : isSelected
                        ? "bg-blue-900/60 border-blue-400"
                        : "bg-neutral-700/50 border-neutral-600 hover:border-neutral-400"
                    }
                  `}
                >
                  <span
                    className={`font-mono font-bold ${
                      isFiltered ? "text-base" : "text-sm"
                    }`}
                    style={{ color: tile.color }}
                  >
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
          {phase === "success" ? (
            <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-900/40 rounded-lg border border-emerald-700">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-emerald-300">
                Verification successful
              </span>
            </div>
          ) : phase === "showAny" ? (
            <button
              onClick={handleConfirm}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all"
            >
              Confirm: only &quot;any&quot; shown
            </button>
          ) : phase === "failure" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2 py-2 w-full bg-red-900/40 rounded-lg border border-red-700">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-red-300">
                  Incorrect selection
                </span>
              </div>
              <button
                onClick={handleRefresh}
                className="text-xs text-neutral-400 hover:text-neutral-200 underline transition-colors"
              >
                Get a new challenge
              </button>
            </div>
          ) : (
            <button
              onClick={handleVerify}
              disabled={selected.size === 0 || phase === "verifying"}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                selected.size === 0
                  ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
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

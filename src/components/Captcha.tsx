"use client";

import { useCallback, useState } from "react";

type TileItem = {
  id: number;
  emoji: string;
  label: string;
  category: string;
};

type Challenge = {
  prompt: string;
  category: string;
  tiles: TileItem[];
  correctIds: number[];
};

const ALL_ITEMS: Omit<TileItem, "id">[] = [
  { emoji: "🚗", label: "Car", category: "vehicles" },
  { emoji: "🚌", label: "Bus", category: "vehicles" },
  { emoji: "🚲", label: "Bicycle", category: "vehicles" },
  { emoji: "🛵", label: "Scooter", category: "vehicles" },
  { emoji: "🚁", label: "Helicopter", category: "vehicles" },
  { emoji: "🌳", label: "Tree", category: "nature" },
  { emoji: "🌸", label: "Flower", category: "nature" },
  { emoji: "⛰️", label: "Mountain", category: "nature" },
  { emoji: "🌊", label: "Wave", category: "nature" },
  { emoji: "🏠", label: "House", category: "buildings" },
  { emoji: "🏢", label: "Office", category: "buildings" },
  { emoji: "🏛️", label: "Temple", category: "buildings" },
  { emoji: "🚦", label: "Traffic Light", category: "street" },
  { emoji: "🛑", label: "Stop Sign", category: "street" },
  { emoji: "🚧", label: "Barrier", category: "street" },
  { emoji: "🐕", label: "Dog", category: "animals" },
  { emoji: "🐈", label: "Cat", category: "animals" },
  { emoji: "🐦", label: "Bird", category: "animals" },
  { emoji: "🍕", label: "Pizza", category: "food" },
  { emoji: "🍔", label: "Burger", category: "food" },
  { emoji: "🍩", label: "Donut", category: "food" },
  { emoji: "☕", label: "Coffee", category: "food" },
  { emoji: "⚽", label: "Soccer", category: "sports" },
  { emoji: "🏀", label: "Basketball", category: "sports" },
  { emoji: "🎾", label: "Tennis", category: "sports" },
];

const CATEGORY_LABELS: Record<string, string> = {
  vehicles: "vehicles",
  nature: "nature",
  buildings: "buildings",
  street: "street items",
  animals: "animals",
  food: "food",
  sports: "sports equipment",
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateChallenge(): Challenge {
  const categories = [...new Set(ALL_ITEMS.map((item) => item.category))];
  const targetCategory = categories[Math.floor(Math.random() * categories.length)];

  const matching = ALL_ITEMS.filter((item) => item.category === targetCategory);
  const nonMatching = ALL_ITEMS.filter((item) => item.category !== targetCategory);

  const shuffledMatching = shuffleArray(matching);
  const shuffledNonMatching = shuffleArray(nonMatching);

  const numCorrect = Math.min(3 + Math.floor(Math.random() * 2), shuffledMatching.length);
  const numIncorrect = 9 - numCorrect;

  const selectedCorrect = shuffledMatching.slice(0, numCorrect);
  const selectedIncorrect = shuffledNonMatching.slice(0, numIncorrect);

  const tiles = shuffleArray(
    [...selectedCorrect, ...selectedIncorrect].map((item, index) => ({
      ...item,
      id: index,
    }))
  );

  return {
    prompt: `Select all images containing ${CATEGORY_LABELS[targetCategory]}`,
    category: targetCategory,
    tiles,
    correctIds: tiles
      .filter((t) => t.category === targetCategory)
      .map((t) => t.id),
  };
}

type CaptchaState = "idle" | "verifying" | "success" | "failure";

export default function Captcha() {
  const [challenge, setChallenge] = useState<Challenge>(() => generateChallenge());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [state, setState] = useState<CaptchaState>("idle");

  const handleTileClick = useCallback(
    (id: number) => {
      if (state === "verifying" || state === "success") return;
      setState("idle");
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
    [state]
  );

  const handleVerify = useCallback(() => {
    setState("verifying");

    setTimeout(() => {
      const isCorrect =
        selected.size === challenge.correctIds.length &&
        challenge.correctIds.every((id) => selected.has(id));

      setState(isCorrect ? "success" : "failure");
    }, 800);
  }, [challenge.correctIds, selected]);

  const handleRefresh = useCallback(() => {
    setChallenge(generateChallenge());
    setSelected(new Set());
    setState("idle");
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto select-none">
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-neutral-750 px-4 py-3 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors ${
                  state === "success"
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-neutral-500"
                }`}
              >
                {state === "success" && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
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
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-4 py-3">
          <p className="text-sm text-neutral-300 text-center mb-3 font-medium">
            {challenge.prompt}
          </p>

          <div className="grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden">
            {challenge.tiles.map((tile) => {
              const isSelected = selected.has(tile.id);
              const isCorrect =
                state === "success" && challenge.correctIds.includes(tile.id);
              const isWrong =
                state === "failure" &&
                isSelected &&
                !challenge.correctIds.includes(tile.id);
              const isMissed =
                state === "failure" &&
                challenge.correctIds.includes(tile.id) &&
                !isSelected;

              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.id)}
                  className={`
                    relative aspect-square rounded-md flex flex-col items-center justify-center gap-0.5
                    transition-all duration-200 border-2
                    ${
                      isCorrect
                        ? "bg-emerald-900/60 border-emerald-400"
                        : isWrong
                        ? "bg-red-900/60 border-red-400"
                        : isMissed
                        ? "bg-amber-900/40 border-amber-500"
                        : isSelected
                        ? "bg-blue-900/60 border-blue-400"
                        : "bg-neutral-700/50 border-neutral-600 hover:border-neutral-400"
                    }
                  `}
                >
                  <span className="text-2xl md:text-3xl">{tile.emoji}</span>
                  <span className="text-[10px] text-neutral-400">
                    {tile.label}
                  </span>
                  {isSelected && state === "idle" && (
                    <div className="absolute top-1 right-1">
                      <svg
                        className="w-3.5 h-3.5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-4">
          {state === "success" ? (
            <div className="flex items-center justify-center gap-2 py-2 bg-emerald-900/40 rounded-lg border border-emerald-700">
              <svg
                className="w-5 h-5 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-emerald-300">
                Verification successful
              </span>
            </div>
          ) : state === "failure" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2 py-2 w-full bg-red-900/40 rounded-lg border border-red-700">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-red-300">
                  Please try again
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
              disabled={selected.size === 0 || state === "verifying"}
              className={`
                w-full py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  selected.size === 0
                    ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }
              `}
            >
              {state === "verifying" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
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

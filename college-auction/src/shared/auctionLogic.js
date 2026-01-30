import { CATEGORY_ORDER } from "./constants";

// Utility
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * Get a random UNSOLD player from a category.
 * Skipped players are ignored here.
 */
export function getRandomUnsoldPlayer(players, category) {
  const eligible = players.filter(
    (p) =>
      p.status === "UNSOLD" &&
      (!category || p.category === category)
  );

  if (eligible.length === 0) return null;
  return shuffle(eligible)[0];
}

/**
 * Determines the next category that still has UNSOLD players.
 * SKIPPED players are excluded.
 */
export function getNextCategory(players) {
  for (const cat of CATEGORY_ORDER) {
    const exists = players.some(
      (p) => p.category === cat && p.status === "UNSOLD"
    );
    if (exists) return cat;
  }
  return null;
}

/**
 * After all categories are exhausted,
 * return SKIPPED players for re-auction.
 */
export function getSkippedPlayer(players) {
  const skipped = players.filter((p) => p.status === "SKIPPED");
  if (skipped.length === 0) return null;
  return shuffle(skipped)[0];
}

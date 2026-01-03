import { CATEGORY_ORDER } from "./constants";

export function getNextCategory(currentCategory) {
  const idx = CATEGORY_ORDER.indexOf(currentCategory);
  return idx >= 0 && idx < CATEGORY_ORDER.length - 1
    ? CATEGORY_ORDER[idx + 1]
    : null;
}

export function getRandomUnsoldPlayer(players, category) {
  const eligible = players.filter(
    (p) => p.category === category && p.status === "UNSOLD"
  );

  if (eligible.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
}

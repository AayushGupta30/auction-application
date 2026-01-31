import { createInitialTeams } from "./models";
import { CATEGORY_ORDER } from "./constants";
import { loadAuctionState as loadFromStorage, saveAuctionState as saveToStorage } from "./storage";

/**
 * Create a fresh auction state.
 * Always starts from Marquee.
 */
export function createInitialAuctionState(players) {
  return {
    meta: {
      currentCategory: CATEGORY_ORDER[0], // "Marquee"
      auctionStarted: false,
      lastUpdated: null
    },

    players,
    teams: createInitialTeams(),

    currentPlayerId: null,
    soldHistory: []
  };
}

/**
 * Load auction state safely.
 * If incompatible, reset cleanly.
 */
export function loadAuctionState(players) {
  const savedState = loadFromStorage();

  // No saved state → fresh start
  if (!savedState) {
    return createInitialAuctionState(players);
  }

  // Invalid or legacy category → reset
  if (
    !savedState.meta ||
    !CATEGORY_ORDER.includes(savedState.meta.currentCategory)
  ) {
    return createInitialAuctionState(players);
  }

  // Player dataset changed → reset
  if (
    !savedState.players ||
    savedState.players.length !== players.length
  ) {
    return createInitialAuctionState(players);
  }

  // Resume safely with latest players
  return {
    ...savedState,
    players
  };
}

/**
 * Persist auction state
 */
export function persistAuctionState(state) {
  saveToStorage(state);
}

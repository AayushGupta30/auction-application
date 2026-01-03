import { createInitialTeams } from "./models";

export function createInitialAuctionState(players) {
  return {
    meta: {
      currentCategory: "Platinum",
      auctionStarted: false,
      lastUpdated: null
    },

    players,
    teams: createInitialTeams(),

    currentPlayerId: null,
    soldHistory: []
  };
}

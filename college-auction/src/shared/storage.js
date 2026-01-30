import { AUCTION_STORAGE_KEY } from "./constants";

export function loadAuctionState() {
  try {
    const raw = localStorage.getItem(AUCTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to load auction state", e);
    return null;
  }
}

export function saveAuctionState(state) {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(AUCTION_STORAGE_KEY, serialized);
  } catch (e) {
    console.error("Failed to save auction state", e);
  }
}

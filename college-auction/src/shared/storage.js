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

    // Publish to public/state.json (static hosting safe trick)
    fetch("/state.json", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: serialized
    }).catch(() => {
      // Ignore in dev / GH Pages
    });
  } catch (e) {
    console.error("Failed to save auction state", e);
  }
}

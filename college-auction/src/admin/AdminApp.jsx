import { useEffect, useState } from "react";
import "./admin.css";

import { normalizePlayers } from "../shared/models";
import { createInitialAuctionState } from "../shared/auctionState";
import { loadAuctionState, saveAuctionState } from "../shared/storage";
import {
  getRandomUnsoldPlayer,
  getNextCategory,
  getSkippedPlayer
} from "../shared/auctionLogic";

import AdminControl from "./AdminControl";
import AdminSummary from "./AdminSummary";
import AdminHistory from "./AdminHistory";

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
  : null;

const AUTH_HEADER = {
  Authorization:
    "Basic " +
    btoa(
      `${import.meta.env.VITE_ADMIN_USER}:${import.meta.env.VITE_ADMIN_PASS}`
    )
};

export default function AdminApp() {
  const [auctionState, setAuctionState] = useState(null);

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    const saved = loadAuctionState();
    if (saved) {
      setAuctionState(saved);
      return;
    }
    initializeFreshAuction();
  }, []);

  function initializeFreshAuction() {
    fetch("/players.json")
      .then((res) => res.json())
      .then((data) => {
        const fresh = createInitialAuctionState(
          normalizePlayers(data)
        );
        setAuctionState(fresh);
        saveAuctionState(fresh);

        if (API_BASE) {
          pushStateToBackend(fresh);
        }
      });
  }

  function pushStateToBackend(state) {
    fetch(`${API_BASE}/state`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AUTH_HEADER
      },
      body: JSON.stringify(state)
    }).catch(() => {});
  }

  // ===============================
  // AUTO SYNC
  // ===============================
  useEffect(() => {
    if (!auctionState) return;
    saveAuctionState(auctionState);
    if (API_BASE) pushStateToBackend(auctionState);
  }, [auctionState]);

  // ===============================
  // RESET AUCTION
  // ===============================
  function resetAuction() {
    const ok = window.confirm(
      "⚠️ RESET AUCTION\n\nThis will wipe all auction data."
    );
    if (!ok) return;

    localStorage.removeItem("auctionState");

    const resetBackend = API_BASE
      ? fetch(`${API_BASE}/state`, {
          method: "DELETE",
          headers: AUTH_HEADER
        })
      : Promise.resolve();

    resetBackend.finally(() => {
      initializeFreshAuction();
    });
  }

  // ===============================
  // UNDO LAST SALE
  // ===============================
  function undoLastSale() {
    if (!auctionState || auctionState.soldHistory.length === 0) return;

    const ok = window.confirm("Undo last sale?");
    if (!ok) return;

    fetch(`${API_BASE}/undo-last-sale`, {
      method: "POST",
      headers: AUTH_HEADER
    })
      .then((res) => res.json())
      .then(() => {
        fetch(`${API_BASE}/state`)
          .then((r) => r.json())
          .then((data) => {
            setAuctionState(data);
            saveAuctionState(data);
          });
      });
  }

  // ===============================
  // DRAW / FINALIZE / SKIP
  // ===============================
  function drawNextPlayer() {
    setAuctionState((prev) => {
      let category = prev.meta.currentCategory;
      let player = getRandomUnsoldPlayer(prev.players, category);

      while (!player) {
        const next = getNextCategory(prev.players);
        if (!next) break;
        category = next;
        player = getRandomUnsoldPlayer(prev.players, category);
      }

      if (!player) {
        player = getSkippedPlayer(prev.players);
        if (!player) {
          alert("Auction complete.");
          return prev;
        }
      }

      return {
        ...prev,
        meta: {
          ...prev.meta,
          auctionStarted: true,
          currentCategory: category
        },
        currentPlayerId: player.id
      };
    });
  }

  function finalizeSale(teamId, bid) {
    setAuctionState((prev) => {
      if (!prev.currentPlayerId) return prev;

      const playerId = prev.currentPlayerId;

      // SKIP
      if (teamId === "SKIP") {
        const players = prev.players.map((p) =>
          p.id === playerId
            ? { ...p, status: "SKIPPED", soldPrice: 0 }
            : p
        );

        const skipped = players.find((p) => p.id === playerId);

        return {
          ...prev,
          players,
          soldHistory: [
            {
              playerId: skipped.id,
              playerName: skipped.name,
              category: skipped.category,
              teamName: "SKIPPED",
              teamId: null,
              price: 0
            },
            ...prev.soldHistory
          ],
          currentPlayerId: null
        };
      }

      const team = prev.teams.find((t) => t.id === teamId);
      const price = Number(bid);
      if (!team || price > team.remainingPurse) return prev;

      const players = prev.players.map((p) =>
        p.id === playerId
          ? { ...p, status: "SOLD", soldTo: team.id, soldPrice: price }
          : p
      );

      const teams = prev.teams.map((t) =>
        t.id === team.id
          ? {
              ...t,
              remainingPurse: t.remainingPurse - price,
              players: [...t.players, playerId]
            }
          : t
      );

      const sold = players.find((p) => p.id === playerId);

      return {
        ...prev,
        players,
        teams,
        soldHistory: [
          {
            playerId: sold.id,
            playerName: sold.name,
            category: sold.category,
            teamName: team.name,
            teamId: team.id,
            price
          },
          ...prev.soldHistory
        ],
        currentPlayerId: null
      };
    });
  }

  if (!auctionState) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <h2>Loading Admin Panel…</h2>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Animated Background */}
      <div className="admin-bg-grid"></div>
      <div className="admin-bg-accent"></div>
      
      <div className="admin-content">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <div className="admin-badge">CONTROL PANEL</div>
            <h1 className="admin-title">Auction Command Center</h1>
          </div>
          
          <div className="admin-meta-cards">
            <div className="meta-card">
              <div className="meta-label">Current Category</div>
              <div className="meta-value">{auctionState.meta.currentCategory}</div>
            </div>
            <div className="meta-card">
              <div className="meta-label">Total Players</div>
              <div className="meta-value">{auctionState.players.length}</div>
            </div>
            <div className="meta-card">
              <div className="meta-label">Sold</div>
              <div className="meta-value">
                {auctionState.players.filter(p => p.status === "SOLD").length}
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="admin-main-grid">
          <AdminControl
            auctionState={auctionState}
            drawNextPlayer={drawNextPlayer}
            finalizeSale={finalizeSale}
          />
          <AdminSummary auctionState={auctionState} />
        </div>

        {/* History */}
        <AdminHistory
          soldHistory={auctionState.soldHistory}
          teams={auctionState.teams}
          onUndoLastSale={undoLastSale}
          onResetAuction={resetAuction}
        />
      </div>
    </div>
  );
}
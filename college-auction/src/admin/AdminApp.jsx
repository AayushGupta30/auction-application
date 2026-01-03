import { useEffect, useState } from "react";
import "./admin.css";

import { normalizePlayers } from "../shared/models";
import { createInitialAuctionState } from "../shared/auctionState";
import { loadAuctionState, saveAuctionState } from "../shared/storage";
import {
  getRandomUnsoldPlayer,
  getNextCategory
} from "../shared/auctionLogic";
import { CATEGORY_ORDER } from "../shared/constants";

export default function AdminApp() {
  const [auctionState, setAuctionState] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    const savedState = loadAuctionState();

    if (savedState) {
      setAuctionState(savedState);
      return;
    }

    fetch("/players.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load players.json");
        return res.json();
      })
      .then((data) => {
        const players = normalizePlayers(data);
        const initialState = createInitialAuctionState(players);
        setAuctionState(initialState);
        saveAuctionState(initialState);
      })
      .catch((err) => {
        console.error(err);
        alert("Error initializing auction state");
      });
  }, []);

  // ---------- AUTO SAVE + PUSH TO BACKEND ----------
  useEffect(() => {
    if (!auctionState) return;

    // Save locally
    saveAuctionState(auctionState);

    // Push to backend
    fetch("http://localhost:4000/state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa("admin:auction123")
      },
      body: JSON.stringify(auctionState)
    }).catch(() => {});
  }, [auctionState]);

  // ---------- UNDO LAST SALE ----------
  function undoLastSale() {
    const confirmUndo = window.confirm(
      "Are you sure you want to UNDO the last sale?\nThis action is logged and cannot be reversed."
    );

    if (!confirmUndo) return;

    fetch("http://localhost:4000/undo-last-sale", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa("admin:auction123")
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Undo failed");
        return res.json();
      })
      .then(() => {
        // Refresh state from backend
        fetch("http://localhost:4000/state")
          .then((r) => r.json())
          .then(setAuctionState);
      })
      .catch(() => {
        alert("Failed to undo last sale");
      });
  }

  // ---------- DRAW NEXT PLAYER ----------
  function drawNextPlayer() {
    setSelectedTeamId("");
    setBidAmount("");

    setAuctionState((prev) => {
      if (!prev) return prev;

      let category = prev.meta.currentCategory;
      let player = getRandomUnsoldPlayer(prev.players, category);

      while (!player) {
        const nextCategory = getNextCategory(category);
        if (!nextCategory) {
          alert("Auction complete. No players remaining.");
          return prev;
        }
        category = nextCategory;
        player = getRandomUnsoldPlayer(prev.players, category);
      }

      return {
        ...prev,
        meta: {
          ...prev.meta,
          currentCategory: category,
          auctionStarted: true,
          lastUpdated: new Date().toISOString()
        },
        currentPlayerId: player.id
      };
    });
  }

  // ---------- FINALIZE SALE ----------
  function finalizeSale() {
    if (!selectedTeamId || !bidAmount) {
      alert("Select team and enter bid amount.");
      return;
    }

    const bid = Number(bidAmount);
    if (isNaN(bid) || bid <= 0) {
      alert("Enter a valid bid amount.");
      return;
    }

    setAuctionState((prev) => {
      if (!prev || !prev.currentPlayerId) return prev;

      const team = prev.teams.find((t) => t.id === selectedTeamId);
      if (!team) return prev;

      if (bid > team.remainingPurse) {
        alert("Bid exceeds team's remaining purse.");
        return prev;
      }

      const players = prev.players.map((p) =>
        p.id === prev.currentPlayerId
          ? {
              ...p,
              status: "SOLD",
              soldTo: team.id,
              soldPrice: bid
            }
          : p
      );

      const updatedTeams = prev.teams.map((t) =>
        t.id === team.id
          ? {
              ...t,
              remainingPurse: t.remainingPurse - bid,
              players: [...t.players, prev.currentPlayerId]
            }
          : t
      );

      const soldPlayer = players.find(
        (p) => p.id === prev.currentPlayerId
      );

      return {
        ...prev,
        players,
        teams: updatedTeams,
        soldHistory: [
          {
            playerId: soldPlayer.id,
            playerName: soldPlayer.name,
            category: soldPlayer.category,
            teamId: team.id,
            teamName: team.name,
            price: bid
          },
          ...prev.soldHistory
        ],
        currentPlayerId: null
      };
    });
  }

  if (!auctionState) {
    return <p style={{ padding: "20px" }}>Loading auction state...</p>;
  }

  const currentPlayer = auctionState.players.find(
    (p) => p.id === auctionState.currentPlayerId
  );

  // ---------- CATEGORY SUMMARY ----------
  const categorySummary = CATEGORY_ORDER.map((cat) => {
    const total = auctionState.players.filter(
      (p) => p.category === cat
    ).length;

    const sold = auctionState.players.filter(
      (p) => p.category === cat && p.status === "SOLD"
    ).length;

    return { cat, sold, total };
  });

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Auction Panel</h1>
        <div className="status-box">
          <div><strong>Category:</strong> {auctionState.meta.currentCategory}</div>
          <div><strong>Total Players:</strong> {auctionState.players.length}</div>
        </div>
      </div>

      <div className="main-grid">
        {/* LEFT PANEL */}
        <div className="panel">
          <h2>Auction Control</h2>
          <button className="primary-btn draw" onClick={drawNextPlayer}>
            Draw Next Player
          </button>

          {currentPlayer && (
            <div className="current-player">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={currentPlayer.image}
                  alt={currentPlayer.name}
                  style={{ width: "80px", height: "80px", marginRight: "15px" }}
                />
                <div>
                  <h3 style={{ margin: 0 }}>{currentPlayer.name}</h3>
                  <p style={{ margin: 0 }}>
                    {currentPlayer.category} | {currentPlayer.gender}
                  </p>
                </div>
              </div>

              <h4>Finalize Sale</h4>

              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                <option value="">Select Team</option>
                {auctionState.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>

              <br /><br />

              <input
                type="number"
                placeholder="Bid Amount (₹ Cr)"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />

              <br /><br />

              <button className="primary-btn finalize" onClick={finalizeSale}>
                Finalize Sale
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="panel">
          <h2>Teams</h2>
          <ul className="team-list">
            {auctionState.teams.map((team) => {
              const isLow = team.remainingPurse <= 10;

              const teamClass =
                team.id === "RED_HAWKS" ? "team-red" :
                team.id === "BLUE_BEAST" ? "team-blue" :
                team.id === "WHITE_WALKERS" ? "team-white" :
                "team-black";

              return (
                <li key={team.id} className={`team-item ${teamClass}`}>
                  <img src={team.logo} alt={team.name} />
                  <strong>{team.name}</strong> — ₹{team.remainingPurse} Cr
                  {isLow && <span className="low-purse">LOW</span>}
                </li>
              );
            })}
          </ul>

          <h2>Category Progress</h2>
          <ul>
            {categorySummary.map((c) => (
              <li key={c.cat}>
                {c.cat}: {c.sold}/{c.total}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel table-container">
        <h2>Recent Auctions</h2>

        <button
          onClick={undoLastSale}
          style={{
            marginBottom: "10px",
            background: "#d32f2f",
            color: "white",
            padding: "8px 12px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Undo Last Sale
        </button>

        {auctionState.soldHistory.length === 0 ? (
          <p>No auctions completed yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Category</th>
                <th>Team</th>
                <th>Price (₹ Cr)</th>
              </tr>
            </thead>
            <tbody>
              {auctionState.soldHistory.map((sale, idx) => (
                <tr key={idx}>
                  <td>{sale.playerName}</td>
                  <td>{sale.category}</td>
                  <td>{sale.teamName}</td>
                  <td>{sale.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

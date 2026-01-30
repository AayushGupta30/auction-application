import { useState } from "react";

export default function AdminControl({
  auctionState,
  drawNextPlayer,
  finalizeSale
}) {
  const [teamId, setTeamId] = useState("");
  const [bid, setBid] = useState("");

  const currentPlayer = auctionState.players.find(
    (p) => p.id === auctionState.currentPlayerId
  );

  const imageSrc =
    currentPlayer?.photo ||
    currentPlayer?.image ||
    currentPlayer?.profilePhoto ||
    currentPlayer?.photoUrl ||
    "";

  return (
    <section className="admin-panel control-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="panel-icon">⚡</span>
          Auction Control
        </h2>
        <button className="btn-draw" onClick={drawNextPlayer}>
          <span className="btn-icon">🎲</span>
          Draw Next Player
        </button>
      </div>

      {!currentPlayer && (
        <div className="no-player-state">
          <div className="empty-icon">🎯</div>
          <p className="empty-message">No player currently on auction</p>
          <p className="empty-hint">Click "Draw Next Player" to begin</p>
        </div>
      )}

      {currentPlayer && (
        <div className="control-grid">
          {/* Player Card */}
          <div className="current-player-card">
            <div className="player-card-header">
              <span className="on-block-label">ON BLOCK</span>
              <span className={`category-pill pill-${currentPlayer.category.toLowerCase()}`}>
                {currentPlayer.category}
              </span>
            </div>
            
            <div className="player-image-container">
              {imageSrc ? (
                <img src={imageSrc} alt={currentPlayer.name} className="player-image-large" />
              ) : (
                <div className="player-image-placeholder-large">
                  <span className="placeholder-icon">👤</span>
                </div>
              )}
            </div>

            <div className="player-card-info">
              <h3 className="player-name-large">{currentPlayer.name}</h3>
            </div>
          </div>

          {/* Bid Controls */}
          <div className="bid-control-section">
            <h3 className="bid-section-title">Bidding Controls</h3>
            
            <div className="control-group">
              <label className="control-label">
                <span className="label-icon">🏆</span>
                Select Team
              </label>
              <select
                className="control-select"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              >
                <option value="">Choose a team...</option>
                <option value="SKIP">⏭ Skip This Player</option>
                {auctionState.teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — ₹{t.remainingPurse} Cr
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label className="control-label">
                <span className="label-icon">💰</span>
                Bid Amount (₹ Crores)
              </label>
              <input
                type="number"
                className="control-input"
                min="0"
                step="0.1"
                placeholder="Enter bid amount..."
                value={bid}
                onChange={(e) => setBid(e.target.value)}
              />
            </div>

            <button
              className="btn-finalize"
              disabled={!teamId}
              onClick={() => {
                finalizeSale(teamId, bid);
                setTeamId("");
                setBid("");
              }}
            >
              <span className="btn-icon">✓</span>
              Finalize Sale
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
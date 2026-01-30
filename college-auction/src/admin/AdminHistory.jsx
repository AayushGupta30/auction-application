export default function AdminHistory({
  soldHistory,
  teams,
  onUndoLastSale,
  onResetAuction
}) {
  // Helper to get team logo by teamId or teamName
  function getTeamLogo(entry) {
    if (entry.teamName === "SKIPPED") return null;
    
    const team = teams?.find(t => 
      t.id === entry.teamId || t.name === entry.teamName
    );
    return team?.logo;
  }

  return (
    <section className="admin-panel history-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="panel-icon">📜</span>
          Auction History
        </h2>
        
        <div className="history-actions">
          <button
            onClick={onUndoLastSale}
            className="btn-undo"
            disabled={soldHistory.length === 0}
          >
            <span className="btn-icon">↶</span>
            Undo Last
          </button>

          <button 
            onClick={onResetAuction} 
            className="btn-reset"
          >
            <span className="btn-icon">⚠</span>
            Reset Auction
          </button>
        </div>
      </div>

      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th className="col-player">Player</th>
              <th className="col-category">Category</th>
              <th className="col-team">Team</th>
              <th className="col-logo"></th>
              <th className="col-price">Price</th>
            </tr>
          </thead>

          <tbody>
            {soldHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <div className="empty-state-content">
                    <span className="empty-icon">📭</span>
                    <p>No auctions yet</p>
                    <p className="empty-hint">Start by drawing a player</p>
                  </div>
                </td>
              </tr>
            ) : (
              soldHistory.map((entry, i) => {
                const teamLogo = getTeamLogo(entry);
                const isSkipped = entry.teamName === "SKIPPED";

                return (
                  <tr
                    key={i}
                    className={`history-row ${isSkipped ? 'row-skipped' : ''}`}
                  >
                    <td className="player-name-cell">
                      {entry.playerName}
                    </td>
                    
                    <td className="category-cell">
                      <span className={`category-badge-small badge-${entry.category.toLowerCase()}`}>
                        {entry.category}
                      </span>
                    </td>
                    
                    <td className="team-name-cell">
                      {entry.teamName}
                    </td>

                    <td className="team-logo-cell">
                      {teamLogo && (
                        <img
                          src={teamLogo}
                          alt={entry.teamName}
                          className="team-logo-small"
                        />
                      )}
                    </td>

                    <td className="price-cell">
                      {isSkipped ? (
                        <span className="skipped-label">SKIPPED</span>
                      ) : (
                        <span className="price-value">₹{entry.price.toFixed(2)} Cr</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
import { CATEGORY_ORDER } from "../shared/constants";

export default function AdminSummary({ auctionState }) {
  return (
    <section className="admin-panel summary-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="panel-icon">📊</span>
          Quick Overview
        </h2>
      </div>

      {/* Teams Section */}
      <div className="summary-section">
        <h3 className="summary-section-title">Teams & Budgets</h3>
        <div className="teams-list">
          {auctionState.teams.map((team) => {
            const spent = team.initialPurse - team.remainingPurse;
            const spentPercent = (spent / team.initialPurse) * 100;
            
            return (
              <div className="team-summary-card" key={team.id}>
                <div className="team-summary-header">
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="team-logo-summary"
                  />
                  <div className="team-summary-info">
                    <div className="team-summary-name">{team.name}</div>
                    <div className="team-summary-players">
                      {team.players.length} players
                    </div>
                  </div>
                </div>
                
                <div className="team-budget-bar">
                  <div 
                    className="team-budget-fill" 
                    style={{ width: `${spentPercent}%` }}
                  ></div>
                </div>
                
                <div className="team-budget-details">
                  <span className="budget-spent">Spent: ₹{spent.toFixed(2)} Cr</span>
                  <span className="budget-remaining">₹{team.remainingPurse} Cr</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Progress */}
      <div className="summary-section">
        <h3 className="summary-section-title">Category Progress</h3>
        <div className="category-progress-list">
          {CATEGORY_ORDER.map((cat) => {
            const total = auctionState.players.filter(
              (p) => p.category === cat
            ).length;

            const sold = auctionState.players.filter(
              (p) => p.category === cat && p.status !== "UNSOLD"
            ).length;

            const progress = (sold / total) * 100;

            return (
              <div key={cat} className="category-progress-item">
                <div className="category-progress-header">
                  <div className="category-info">
                    <span className="category-icon">{getCategoryIcon(cat)}</span>
                    <span className="category-name">{cat}</span>
                  </div>
                  <span className="category-count">
                    {sold}/{total}
                  </span>
                </div>
                <div className="category-progress-bar">
                  <div 
                    className={`category-progress-fill category-${cat.toLowerCase()}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function getCategoryIcon(category) {
  switch (category) {
    case "Marquee":
      return "💎";
    case "A":
      return "🔷";
    case "B":
      return "🟢";
    case "C":
      return "🔵";
    default:
      return "•";
  }
}
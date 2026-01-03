import { useEffect, useState } from "react";
import "./public.css";

export default function PublicApp() {
  const [state, setState] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  function fetchState() {
    fetch("http://localhost:4000/state")
      .then(res => res.json())
      .then(data => {
        if (data && data.players) {
          setState(data);
          if (!activeTeamId) {
            setActiveTeamId(data.teams[0]?.id);
          }
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetchState();
    const i = setInterval(fetchState, 5000);
    return () => clearInterval(i);
  }, []);

  if (!state) {
    return <div className="public-container">Waiting for auction to start…</div>;
  }

  const soldPlayers = state.players.filter(p => p.status === "SOLD");
  const lastSold = state.soldHistory[0];

  const costliest = soldPlayers.reduce(
    (m, p) => p.soldPrice > (m?.soldPrice ?? 0) ? p : m,
    null
  );

  const topTeam = state.teams
    .map(t => ({
      ...t,
      spent: t.initialPurse - t.remainingPurse
    }))
    .sort((a, b) => b.spent - a.spent)[0];

  const activeTeam = state.teams.find(t => t.id === activeTeamId);
  const teamPlayers = state.players.filter(p => p.soldTo === activeTeamId);

  const spent = activeTeam.initialPurse - activeTeam.remainingPurse;
  const avg = teamPlayers.length ? (spent / teamPlayers.length).toFixed(2) : "0.00";
  const usedPercent = (spent / activeTeam.initialPurse) * 100;

  const filteredAuctions = state.soldHistory.filter(s => {
    return (
      s.playerName.toLowerCase().includes(search.toLowerCase()) &&
      (!teamFilter || s.teamId === teamFilter)
    );
  });

  return (
    <div className="public-container">
      <div className="header">
        <h1>College Sports League Auction</h1>
      </div>

      {/* ---------- HERO KPIs ---------- */}
      <div className="hero-grid">
        <div className="hero-card">
          <h3>Last Sold Player</h3>
          <h2>{lastSold ? `${lastSold.playerName} — ₹${lastSold.price.toFixed(2)} Cr` : "—"}</h2>
        </div>

        <div className="hero-card">
          <h3>Costliest Player</h3>
          <h2>{costliest ? `${costliest.name} — ₹${costliest.soldPrice.toFixed(2)} Cr` : "—"}</h2>
        </div>

        <div className="hero-card">
          <h3>Highest Spending Team</h3>
          <h2>{topTeam ? `${topTeam.name} — ₹${topTeam.spent.toFixed(2)} Cr` : "—"}</h2>
        </div>
      </div>

      {/* ---------- TEAM TABS ---------- */}
      <div className="team-tabs">
        {state.teams.map(team => (
          <div
            key={team.id}
            className={`team-tab ${team.id === activeTeamId ? "active" : ""}`}
            onClick={() => setActiveTeamId(team.id)}
          >
            {team.name}
          </div>
        ))}
      </div>

      {/* ---------- ACTIVE TEAM PANEL ---------- */}
      <div className="team-section">
        <div className="team-header">
          <img src={activeTeam.logo} alt={activeTeam.name} />
          <h2>{activeTeam.name}</h2>
        </div>

        <div className="meter">
          <div className="meter-fill" style={{ width: `${usedPercent}%` }} />
        </div>

        <div className="team-kpis">
          <div className="team-kpi">Players: {teamPlayers.length}</div>
          <div className="team-kpi">Avg Price: ₹{avg} Cr</div>
          <div className="team-kpi">Remaining: ₹{activeTeam.remainingPurse} Cr</div>
        </div>

        <div className="player-grid">
          {teamPlayers.map(p => (
            <div key={p.id} className="player-card">
              <img src={p.image} alt={p.name} />
              <h4>{p.name}</h4>
              <span className={`badge badge-${p.category}`}>{p.category}</span>
              <br />
              <span>₹{p.soldPrice} Cr</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- RECENT AUCTIONS ---------- */}
      <div className="table-container">
        <h2>Recent Auctions</h2>

        <div className="search-row">
          <input
            placeholder="Search player"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
            <option value="">All Teams</option>
            {state.teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <table className="auction-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Category</th>
              <th>Team</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredAuctions.map((s, i) => (
              <tr key={i}>
                <td>{s.playerName}</td>
                <td>{s.category}</td>
                <td>{s.teamName}</td>
                <td>₹{s.price.toFixed(2)} Cr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="footer">
        Auto-refresh every 5 seconds • Live Auction View
      </div>
    </div>
  );
}

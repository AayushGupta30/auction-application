const API_BASE = import.meta.env.VITE_API_BASE_URL;

import { useEffect, useState } from "react";
import "./public.css";

export default function PublicApp() {
  const [state, setState] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  // Get team-specific colors based on team name
  function getTeamColors(teamName) {
    const name = teamName?.toLowerCase() || '';
    
    if (name.includes('red') || name.includes('hawk')) {
      return {
        primary: '#ff3366',
        secondary: '#ff6b9d',
        gradient: 'linear-gradient(135deg, #ff3366 0%, #ff6b9d 100%)',
        glow: 'rgba(255, 51, 102, 0.4)'
      };
    } else if (name.includes('blue') || name.includes('beast')) {
      return {
        primary: '#0066ff',
        secondary: '#3d8bff',
        gradient: 'linear-gradient(135deg, #0066ff 0%, #3d8bff 100%)',
        glow: 'rgba(0, 102, 255, 0.4)'
      };
    } else if (name.includes('green') || name.includes('titan')) {
      return {
        primary: '#00cc66',
        secondary: '#33d983',
        gradient: 'linear-gradient(135deg, #00cc66 0%, #33d983 100%)',
        glow: 'rgba(0, 204, 102, 0.4)'
      };
    } else if (name.includes('gold') || name.includes('lion')) {
      return {
        primary: '#ffa500',
        secondary: '#ffbb33',
        gradient: 'linear-gradient(135deg, #ffa500 0%, #ffbb33 100%)',
        glow: 'rgba(255, 165, 0, 0.4)'
      };
    } else if (name.includes('purple') || name.includes('phoenix')) {
      return {
        primary: '#9933ff',
        secondary: '#b366ff',
        gradient: 'linear-gradient(135deg, #9933ff 0%, #b366ff 100%)',
        glow: 'rgba(153, 51, 255, 0.4)'
      };
    } else if (name.includes('black') || name.includes('panther')) {
      return {
        primary: '#1a1a1a',
        secondary: '#404040',
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)',
        glow: 'rgba(26, 26, 26, 0.4)'
      };
    } else {
      // Default cyan color
      return {
        primary: '#00d4ff',
        secondary: '#33ddff',
        gradient: 'linear-gradient(135deg, #00d4ff 0%, #33ddff 100%)',
        glow: 'rgba(0, 212, 255, 0.4)'
      };
    }
  }

  function fetchState() {
    fetch(`${API_BASE}/state`)
      .then(res => res.json())
      .then(data => {
        if (data && data.players) {
          setState(data);
          // Only set initial team if activeTeamId hasn't been set yet
          if (activeTeamId === null && data.teams.length > 0) {
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
  }, [activeTeamId]);

  if (!state) {
    return (
      <div className="loading-container">
        <div className="loading-pulse"></div>
        <h2>Waiting for auction to start…</h2>
      </div>
    );
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
  const teamColors = getTeamColors(activeTeam?.name);

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
      {/* Animated Background Elements */}
      <div className="bg-decoration"></div>
      <div className="bg-grid"></div>
      
      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-badge">LIVE</div>
          <h1 className="header-title">
            <span className="title-accent">SOM League 2026</span>
            <span className="title-main">Auction Arena</span>
          </h1>
          <div className="header-subtitle">Real-time Bidding Dashboard</div>
        </header>

        {/* Hero KPIs */}
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-card hero-card-primary">
              <div className="hero-icon">🏆</div>
              <div className="hero-content">
                <div className="hero-label">Last Sold</div>
                <div className="hero-value">
                  {lastSold ? lastSold.playerName : "—"}
                </div>
                <div className="hero-price">
                  {lastSold ? `₹${lastSold.price.toFixed(2)} Cr` : ""}
                </div>
              </div>
            </div>

            <div className="hero-card hero-card-secondary">
              <div className="hero-icon">💎</div>
              <div className="hero-content">
                <div className="hero-label">Costliest Player</div>
                <div className="hero-value">
                  {costliest ? costliest.name : "—"}
                </div>
                <div className="hero-price">
                  {costliest ? `₹${costliest.soldPrice.toFixed(2)} Cr` : ""}
                </div>
              </div>
            </div>

            <div className="hero-card hero-card-tertiary">
              <div className="hero-icon">🔥</div>
              <div className="hero-content">
                <div className="hero-label">Top Spender</div>
                <div className="hero-value">
                  {topTeam ? topTeam.name : "—"}
                </div>
                <div className="hero-price">
                  {topTeam ? `₹${topTeam.spent.toFixed(2)} Cr` : ""}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Tabs */}
        <section className="team-selector">
          <div className="team-tabs">
            {state.teams.map((team, idx) => {
              const isActive = team.id === activeTeamId;
              const colors = getTeamColors(team.name);
              return (
                <button
                  key={team.id}
                  className={`team-tab ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTeamId(team.id)}
                  style={{ 
                    animationDelay: `${idx * 0.1}s`,
                    ...(isActive ? {
                      background: colors.gradient,
                      borderColor: colors.primary,
                      boxShadow: `0 0 20px ${colors.glow}`
                    } : {})
                  }}
                >
                  <img src={team.logo} alt={team.name} className="team-tab-logo" />
                  <span className="team-tab-name">{team.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Team Panel */}
        <section 
          className="team-section"
          style={{
            borderColor: teamColors.primary,
            boxShadow: `0 4px 16px rgba(0, 0, 0, 0.4), 0 0 40px ${teamColors.glow}`
          }}
        >
          <div className="team-header">
            <div className="team-logo-wrapper">
              <img 
                src={activeTeam.logo} 
                alt={activeTeam.name} 
                className="team-logo"
                style={{ borderColor: teamColors.primary }}
              />
            </div>
            <div className="team-info">
              <h2 className="team-name">{activeTeam.name}</h2>
              <div className="team-stats-inline">
                <span className="stat-pill">{teamPlayers.length} Players</span>
                <span className="stat-pill">Avg ₹{avg} Cr</span>
              </div>
            </div>
          </div>

          {/* Purse Meter */}
          <div className="purse-section">
            <div className="purse-label-row">
              <span className="purse-label">Purse Usage</span>
              <span className="purse-percentage" style={{ color: teamColors.primary }}>
                {usedPercent.toFixed(1)}%
              </span>
            </div>
            <div className="meter">
              <div 
                className="meter-fill" 
                style={{ 
                  width: `${usedPercent}%`,
                  background: teamColors.gradient
                }} 
              />
              <div 
                className="meter-glow" 
                style={{ 
                  width: `${usedPercent}%`,
                  boxShadow: `0 0 20px ${teamColors.glow}`
                }} 
              />
            </div>
            <div className="purse-details">
              <span className="purse-spent" style={{ color: teamColors.primary }}>
                Spent: ₹{spent.toFixed(2)} Cr
              </span>
              <span className="purse-remaining">Remaining: ₹{activeTeam.remainingPurse} Cr</span>
            </div>
          </div>

          {/* Player Grid */}
          <div className="player-grid">
            {teamPlayers.map((p, idx) => (
              <div 
                key={p.id} 
                className="player-card"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="player-image-wrapper">
                  <img src={p.image} alt={p.name} className="player-image" />
                  <div className={`category-badge badge-${p.category}`}>
                    {p.category}
                  </div>
                </div>
                <div className="player-details">
                  <h4 className="player-name">{p.name}</h4>
                  <div className="player-price" style={{ color: teamColors.primary }}>
                    ₹{p.soldPrice} Cr
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Auctions */}
        <section className="auctions-section">
          <div className="auctions-header">
            <h2 className="auctions-title">Recent Auctions</h2>
            <div className="search-controls">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search player..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="team-filter-select" 
                value={teamFilter} 
                onChange={e => setTeamFilter(e.target.value)}
              >
                <option value="">All Teams</option>
                {state.teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="auction-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Category</th>
                  <th>Team</th>
                  <th className="text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuctions.map((s, i) => (
                  <tr key={i} style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="player-cell">{s.playerName}</td>
                    <td>
                      <span className={`table-badge badge-${s.category}`}>
                        {s.category}
                      </span>
                    </td>
                    <td className="team-cell">{s.teamName}</td>
                    <td className="price-cell text-right">₹{s.price.toFixed(2)} Cr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-indicator">
            <span className="pulse-dot"></span>
            Auto-refresh every 5 seconds
          </div>
          <div className="footer-text">Live Auction View</div>
        </footer>
      </div>
    </div>
  );
}
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ===============================
// BASIC AUTH CONFIG
// ===============================
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "auction123";

function basicAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).send("Authentication required");
  }

  const decoded = Buffer.from(auth.split(" ")[1], "base64")
    .toString()
    .split(":");

  const [user, pass] = decoded;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return next();
  }

  return res.status(403).send("Forbidden");
}

// ===============================
// IN-MEMORY STATE
// ===============================
let auctionState = null;
let auditLog = [];

// ===============================
// ROUTES
// ===============================

app.get("/", (req, res) => {
  res.send("Auction backend running");
});

// Admin writes state
app.post("/state", basicAuth, (req, res) => {
  auctionState = req.body;
  res.json({ status: "ok" });
});

// Public reads state
app.get("/state", (req, res) => {
  if (!auctionState) {
    return res.json({ status: "waiting" });
  }
  res.json(auctionState);
});

// ===============================
// UNDO LAST SALE (ADMIN ONLY)
// ===============================
app.post("/undo-last-sale", basicAuth, (req, res) => {
  if (!auctionState || auctionState.soldHistory.length === 0) {
    return res.status(400).json({ error: "No sale to undo" });
  }

  const lastSale = auctionState.soldHistory[0];

  const player = auctionState.players.find(
    (p) => p.id === lastSale.playerId
  );

  const team = auctionState.teams.find(
    (t) => t.id === lastSale.teamId
  );

  if (!player || !team) {
    return res.status(500).json({ error: "Inconsistent state" });
  }

  // Reverse player
  player.status = "UNSOLD";
  player.soldTo = null;
  player.soldPrice = null;

  // Reverse team
  team.remainingPurse += lastSale.price;
  team.players = team.players.filter((id) => id !== player.id);

  // Remove from sold history
  auctionState.soldHistory.shift();

  // Audit entry
  auditLog.unshift({
    action: "UNDO_SALE",
    playerName: lastSale.playerName,
    teamName: lastSale.teamName,
    price: lastSale.price,
    timestamp: new Date().toISOString()
  });

  res.json({
    status: "undone",
    undoneSale: lastSale
  });
});

// Optional: view audit log (admin only)
app.get("/audit-log", basicAuth, (req, res) => {
  res.json(auditLog);
});

// Reset (testing only)
app.delete("/state", basicAuth, (req, res) => {
  auctionState = null;
  auditLog = [];
  res.json({ status: "reset" });
});

app.listen(PORT, () => {
  console.log(`Auction backend listening on port ${PORT}`);
});

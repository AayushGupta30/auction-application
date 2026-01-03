export function normalizePlayers(rawPlayers) {
  return rawPlayers.map((p) => ({
    id: p["Roll Number"],
    name: p["Name"],
    gender: p["Gender"],
    category: p["Category"],
    image: p["Profile Photo Image Link"],
    batch: p["Batch"],

    // auction fields
    status: "UNSOLD",        // UNSOLD | SOLD
    soldTo: null,            // teamId
    soldPrice: null
  }));
}

export function createInitialTeams() {
  return [
    {
      id: "RED_HAWKS",
      name: "Red Hawks",
      logo: "https://assets.scorebooklive.com/uploads/production/school/13663/image/redhawks.png",
      initialPurse: 100,          // in Crores
      remainingPurse: 100,
      players: []
    },
    {
      id: "BLUE_BEAST",
      name: "Blue Beast",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmWNI6MBpoUf1MBGW0TXTGEd5kwzMWp508oQ&s",
      initialPurse: 100,
      remainingPurse: 100,
      players: []
    },
    {
      id: "WHITE_WALKERS",
      name: "White Walkers",
      logo: "https://i.pinimg.com/474x/5f/35/cb/5f35cb4d592cf7d2cbb4c1103ce31bf8.jpg",
      initialPurse: 100,
      remainingPurse: 100,
      players: []
    },
    {
      id: "BLACK_PANTHERS",
      name: "Black Panthers",
      logo: "https://i.pinimg.com/1200x/36/f7/44/36f7440dc0ab37648058ebe29c53db87.jpg",
      initialPurse: 100,
      remainingPurse: 100,
      players: []
    }
  ];
}

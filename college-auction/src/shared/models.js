export function normalizePlayers(rawPlayers) {
  return rawPlayers.map((p) => ({
    id: p.id,
    name: p.name,
    gender: p.gender,
    category: p.category,
    image: p.image,
    basePrice: p.basePrice,

    // auction fields
    status: "UNSOLD",
    soldTo: null,
    soldPrice: null
  }));
}


export function createInitialTeams() {
  return [
    {
      id: "RED_HAWKS",
      name: "Red Hawks",
      logo: "https://assets.scorebooklive.com/uploads/production/school/13663/image/redhawks.png",
      initialPurse: 60,          // in Crores
      remainingPurse: 60,
      players: []
    },
    {
      id: "BLUE_BEAST",
      name: "Blue Beast",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmWNI6MBpoUf1MBGW0TXTGEd5kwzMWp508oQ&s",
      initialPurse: 60,
      remainingPurse: 60,
      players: []
    },
    {
      id: "WHITE_WALKERS",
      name: "White Walkers",
      logo: "https://i.pinimg.com/474x/5f/35/cb/5f35cb4d592cf7d2cbb4c1103ce31bf8.jpg",
      initialPurse: 60,
      remainingPurse: 60,
      players: []
    },
    {
      id: "BLACK_PANTHERS",
      name: "Black Panthers",
      logo: "https://i.pinimg.com/1200x/36/f7/44/36f7440dc0ab37648058ebe29c53db87.jpg",
      initialPurse: 60,
      remainingPurse: 60,
      players: []
    }
  ];
}
export const TEAM_META = {
  "Red Hawks": {
    logo: "https://assets.scorebooklive.com/uploads/production/school/13663/image/redhawks.png",
    colorClass: "red-hawks"
  },
  "Blue Beast": {
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmWNI6MBpoUf1MBGW0TXTGEd5kwzMWp508oQ&s",
    colorClass: "blue-beast"
  },
  "White Walkers": {
    logo: "https://i.pinimg.com/474x/5f/35/cb/5f35cb4d592cf7d2cbb4c1103ce31bf8.jpg",
    colorClass: "white-walkers"
  },
  "Black Panthers": {
    logo: "https://i.pinimg.com/1200x/36/f7/44/36f7440dc0ab37648058ebe29c53db87.jpg",
    colorClass: "black-panthers"
  }
};

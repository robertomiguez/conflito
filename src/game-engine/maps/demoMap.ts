import type { GameMap } from "./GameMap";

export const demoMap: GameMap = {
  territories: [
    // --- NORTH AMERICA ---
    { id: "canada", x: 100, y: 100, width: 140, height: 75 },
    { id: "greenland", x: 290, y: 50, width: 120, height: 75 },
    { id: "western-us", x: 60, y: 190, width: 120, height: 75 },
    { id: "eastern-us", x: 200, y: 190, width: 120, height: 75 },
    { id: "central-america", x: 120, y: 285, width: 110, height: 60 },

    // --- SOUTH AMERICA ---
    { id: "venezuela", x: 130, y: 375, width: 110, height: 60 },
    { id: "peru", x: 100, y: 450, width: 110, height: 70 },
    { id: "brazil", x: 230, y: 410, width: 130, height: 90 },
    { id: "argentina", x: 140, y: 540, width: 110, height: 80 },

    // --- EUROPE ---
    { id: "iceland", x: 450, y: 80, width: 90, height: 50 },
    { id: "great-britain", x: 440, y: 150, width: 100, height: 70 },
    { id: "western-europe", x: 440, y: 240, width: 110, height: 80 },
    { id: "northern-europe", x: 560, y: 140, width: 120, height: 75 },
    { id: "southern-europe", x: 570, y: 235, width: 120, height: 80 },
    { id: "ukraine", x: 700, y: 120, width: 120, height: 95 },

    // --- AFRICA ---
    { id: "north-africa", x: 440, y: 350, width: 130, height: 90 },
    { id: "egypt", x: 590, y: 350, width: 100, height: 70 },
    { id: "congo", x: 490, y: 460, width: 100, height: 75 },
    { id: "east-africa", x: 610, y: 440, width: 110, height: 85 },
    { id: "south-africa", x: 540, y: 550, width: 110, height: 80 },
    { id: "madagascar", x: 720, y: 540, width: 90, height: 60 },

    // --- ASIA ---
    { id: "middle-east", x: 730, y: 260, width: 120, height: 85 },
    { id: "ural", x: 840, y: 90, width: 110, height: 75 },
    { id: "siberia", x: 970, y: 70, width: 110, height: 85 },
    { id: "china", x: 870, y: 185, width: 130, height: 90 },
    { id: "india", x: 870, y: 295, width: 110, height: 80 },
    { id: "siam", x: 1000, y: 285, width: 90, height: 75 },
    { id: "kamchatka", x: 1100, y: 130, width: 100, height: 75 },

    // --- AUSTRALIA ---
    { id: "indonesia", x: 990, y: 390, width: 110, height: 65 },
    { id: "new-guinea", x: 1120, y: 390, width: 95, height: 55 },
    { id: "western-australia", x: 1010, y: 475, width: 110, height: 75 },
    { id: "eastern-australia", x: 1130, y: 465, width: 110, height: 80 },
  ],
};

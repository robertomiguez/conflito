import type { GameMap } from "./GameMap";

export const demoMap: GameMap = {
  id: "world-grid",
  name: "World Grid",
  description: "The classic strategic layout",
  territoryShape: "card",
  territories: [
    // --- NORTH AMERICA ---
    { id: "canada", x: 100, y: 100, width: 140, height: 75 },
    { id: "greenland", x: 290, y: 50, width: 120, height: 75 },
    { id: "usa", x: 70, y: 185, width: 190, height: 80 },
    { id: "central-america", x: 80, y: 285, width: 105, height: 58 },
    { id: "honduras", x: 195, y: 295, width: 95, height: 55 },
    { id: "nicaragua", x: 130, y: 350, width: 100, height: 55 },

    // --- SOUTH AMERICA ---
    { id: "colombia", x: 120, y: 415, width: 105, height: 58 },
    { id: "venezuela", x: 235, y: 360, width: 105, height: 58 },
    { id: "peru", x: 95, y: 435, width: 100, height: 64 },
    { id: "bolivia", x: 205, y: 465, width: 100, height: 64 },
    { id: "brazil", x: 315, y: 420, width: 120, height: 86 },
    { id: "chile", x: 90, y: 520, width: 90, height: 76 },
    { id: "argentina", x: 190, y: 555, width: 110, height: 76 },

    // --- EUROPE ---
    { id: "iceland", x: 450, y: 80, width: 90, height: 50 },
    { id: "great-britain", x: 440, y: 150, width: 100, height: 70 },
    { id: "western-europe", x: 440, y: 240, width: 110, height: 80 },
    { id: "northern-europe", x: 555, y: 180, width: 110, height: 68 },
    { id: "norway", x: 555, y: 80, width: 95, height: 60 },
    { id: "sweden", x: 660, y: 80, width: 95, height: 64 },
    { id: "finland", x: 765, y: 80, width: 95, height: 64 },
    { id: "poland", x: 675, y: 190, width: 100, height: 62 },
    { id: "southern-europe", x: 570, y: 270, width: 120, height: 78 },
    { id: "ukraine", x: 790, y: 185, width: 120, height: 90 },

    // --- AFRICA ---
    { id: "north-africa", x: 440, y: 350, width: 130, height: 90 },
    { id: "egypt", x: 590, y: 350, width: 100, height: 70 },
    { id: "congo", x: 490, y: 460, width: 100, height: 75 },
    { id: "angola", x: 500, y: 545, width: 100, height: 70 },
    { id: "east-africa", x: 610, y: 440, width: 110, height: 85 },
    { id: "south-africa", x: 600, y: 560, width: 110, height: 80 },
    { id: "madagascar", x: 720, y: 540, width: 90, height: 60 },

    // --- ASIA ---
    { id: "middle-east", x: 730, y: 260, width: 120, height: 85 },
    { id: "ural", x: 840, y: 90, width: 110, height: 75 },
    { id: "russia", x: 970, y: 70, width: 170, height: 95 },
    { id: "mongolia", x: 1010, y: 180, width: 110, height: 70 },
    { id: "china", x: 870, y: 185, width: 130, height: 90 },
    { id: "japan", x: 1135, y: 215, width: 80, height: 65 },
    { id: "india", x: 870, y: 295, width: 110, height: 80 },
    { id: "siam", x: 1000, y: 285, width: 90, height: 75 },

    // --- AUSTRALIA ---
    { id: "indonesia", x: 990, y: 390, width: 110, height: 65 },
    { id: "new-guinea", x: 1120, y: 390, width: 95, height: 55 },
    { id: "western-australia", x: 1010, y: 475, width: 110, height: 75 },
    { id: "eastern-australia", x: 1130, y: 465, width: 110, height: 80 },
  ],
};

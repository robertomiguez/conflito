import type { MapDefinition } from "../game-engine/types/MapDefinition";

export interface GameEngineMapTerritory {
  id: string;
  name: string;
  continentId: string;
  neighbors: string[];
}

export interface GameEngineMapDefinition extends MapDefinition {
  territories: GameEngineMapTerritory[];
}

export const WORLD_MAP_DEFINITION: GameEngineMapDefinition = {
  territories: [
    // --- NORTH AMERICA ---
    {
      id: "canada",
      name: "Canada",
      continentId: "north-america",
      neighbors: ["greenland", "western-us", "eastern-us"],
    },
    {
      id: "greenland",
      name: "Greenland",
      continentId: "north-america",
      neighbors: ["canada", "iceland"],
    },
    {
      id: "western-us",
      name: "Western US",
      continentId: "north-america",
      neighbors: ["canada", "eastern-us", "central-america"],
    },
    {
      id: "eastern-us",
      name: "Eastern US",
      continentId: "north-america",
      neighbors: ["canada", "western-us", "central-america"],
    },
    {
      id: "central-america",
      name: "Central America",
      continentId: "north-america",
      neighbors: ["western-us", "eastern-us", "venezuela"],
    },

    // --- SOUTH AMERICA ---
    {
      id: "venezuela",
      name: "Venezuela",
      continentId: "south-america",
      neighbors: ["central-america", "peru", "brazil"],
    },
    {
      id: "peru",
      name: "Peru",
      continentId: "south-america",
      neighbors: ["venezuela", "brazil", "argentina"],
    },
    {
      id: "brazil",
      name: "Brazil",
      continentId: "south-america",
      neighbors: ["venezuela", "peru", "argentina", "north-africa"],
    },
    {
      id: "argentina",
      name: "Argentina",
      continentId: "south-america",
      neighbors: ["peru", "brazil"],
    },

    // --- EUROPE ---
    {
      id: "iceland",
      name: "Iceland",
      continentId: "europe",
      neighbors: ["greenland", "great-britain"],
    },
    {
      id: "great-britain",
      name: "Great Britain",
      continentId: "europe",
      neighbors: ["iceland", "western-europe", "northern-europe"],
    },
    {
      id: "western-europe",
      name: "Western Europe",
      continentId: "europe",
      neighbors: ["great-britain", "northern-europe", "southern-europe", "north-africa"],
    },
    {
      id: "northern-europe",
      name: "Northern Europe",
      continentId: "europe",
      neighbors: ["great-britain", "western-europe", "southern-europe", "ukraine"],
    },
    {
      id: "southern-europe",
      name: "Southern Europe",
      continentId: "europe",
      neighbors: ["western-europe", "northern-europe", "ukraine", "north-africa", "egypt", "middle-east"],
    },
    {
      id: "ukraine",
      name: "Ukraine",
      continentId: "europe",
      neighbors: ["northern-europe", "southern-europe", "middle-east", "ural"],
    },

    // --- AFRICA ---
    {
      id: "north-africa",
      name: "North Africa",
      continentId: "africa",
      neighbors: ["brazil", "western-europe", "southern-europe", "egypt", "east-africa", "congo"],
    },
    {
      id: "egypt",
      name: "Egypt",
      continentId: "africa",
      neighbors: ["north-africa", "southern-europe", "middle-east", "east-africa"],
    },
    {
      id: "east-africa",
      name: "East Africa",
      continentId: "africa",
      neighbors: ["egypt", "north-africa", "congo", "south-africa", "madagascar", "middle-east"],
    },
    {
      id: "congo",
      name: "Congo",
      continentId: "africa",
      neighbors: ["north-africa", "east-africa", "south-africa"],
    },
    {
      id: "south-africa",
      name: "South Africa",
      continentId: "africa",
      neighbors: ["congo", "east-africa", "madagascar"],
    },
    {
      id: "madagascar",
      name: "Madagascar",
      continentId: "africa",
      neighbors: ["east-africa", "south-africa"],
    },

    // --- ASIA ---
    {
      id: "middle-east",
      name: "Middle East",
      continentId: "asia",
      neighbors: ["southern-europe", "ukraine", "egypt", "east-africa", "india", "china"],
    },
    {
      id: "ural",
      name: "Ural",
      continentId: "asia",
      neighbors: ["ukraine", "china", "siberia"],
    },
    {
      id: "siberia",
      name: "Siberia",
      continentId: "asia",
      neighbors: ["ural", "china", "kamchatka"],
    },
    {
      id: "china",
      name: "China",
      continentId: "asia",
      neighbors: ["middle-east", "ural", "siberia", "india", "siam"],
    },
    {
      id: "india",
      name: "India",
      continentId: "asia",
      neighbors: ["middle-east", "china", "siam"],
    },
    {
      id: "siam",
      name: "Siam",
      continentId: "asia",
      neighbors: ["india", "china", "indonesia"],
    },
    {
      id: "kamchatka",
      name: "Kamchatka",
      continentId: "asia",
      neighbors: ["siberia"],
    },

    // --- AUSTRALIA ---
    {
      id: "indonesia",
      name: "Indonesia",
      continentId: "australia",
      neighbors: ["siam", "new-guinea", "western-australia"],
    },
    {
      id: "new-guinea",
      name: "New Guinea",
      continentId: "australia",
      neighbors: ["indonesia", "eastern-australia"],
    },
    {
      id: "western-australia",
      name: "Western Australia",
      continentId: "australia",
      neighbors: ["indonesia", "eastern-australia"],
    },
    {
      id: "eastern-australia",
      name: "Eastern Australia",
      continentId: "australia",
      neighbors: ["western-australia", "new-guinea"],
    },
  ],
};

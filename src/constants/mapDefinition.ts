import type { MapDefinition } from "../game-engine/types/MapDefinition";
import { COUNTRY_TERRITORIES } from "./countryTerritories";

export interface GameEngineMapTerritory {
  id: string;
  name: string;
  continentId: string;
  neighbors: string[];
}

export interface GameEngineMapDefinition extends MapDefinition {
  territories: GameEngineMapTerritory[];
}

// A territory is always one real country. Region-level Risk territories are not playable.
export const WORLD_MAP_DEFINITION: GameEngineMapDefinition = {
  territories: COUNTRY_TERRITORIES.map((territory) => ({
    ...territory,
    neighbors: [...territory.neighbors],
  })),
};

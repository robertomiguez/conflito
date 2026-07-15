import type { MapTerritory } from "./MapTerritory";

export interface GameMap {
  id?: string;
  name?: string;
  description?: string;
  territoryShape?: "card" | "island";
  territories: MapTerritory[];
}

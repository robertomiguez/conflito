export interface MapTerritory {
  id: string;
  name: string;
  continentId?: string;
  neighbors: string[];
}

export interface MapDefinition {
  territories: MapTerritory[];
}

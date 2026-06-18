export interface MapTerritory {
  id: string;
  name: string;
  neighbors: string[];
}

export interface MapDefinition {
  territories: MapTerritory[];
}

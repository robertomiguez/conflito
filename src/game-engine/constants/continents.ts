export interface Continent {
  id: string;
  name: string;
  bonus: number;
}

export const CONTINENTS: Record<string, Continent> = {
  "north-america": { id: "north-america", name: "North America", bonus: 3 },
  "south-america": { id: "south-america", name: "South America", bonus: 4 },
  europe: { id: "europe", name: "Europe", bonus: 5 },
  africa: { id: "africa", name: "Africa", bonus: 4 },
  asia: { id: "asia", name: "Asia", bonus: 5 },
  australia: { id: "australia", name: "Australia", bonus: 2 },
};

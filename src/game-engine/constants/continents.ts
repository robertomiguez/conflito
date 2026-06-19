export interface Continent {
  id: string;
  name: string;
  bonus: number;
}

export const CONTINENTS: Record<string, Continent> = {
  "north-america": { id: "north-america", name: "North America", bonus: 5 },
  "south-america": { id: "south-america", name: "South America", bonus: 2 },
  europe: { id: "europe", name: "Europe", bonus: 5 },
  africa: { id: "africa", name: "Africa", bonus: 3 },
  asia: { id: "asia", name: "Asia", bonus: 7 },
  australia: { id: "australia", name: "Australia", bonus: 2 },
};

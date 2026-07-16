import { describe, expect, it } from "vitest";
import { CONTINENTS } from "../game-engine/constants/continents";
import { WORLD_MAP_DEFINITION } from "./mapDefinition";

describe("WORLD_MAP_DEFINITION", () => {
  it("should only reference configured continent bonuses", () => {
    for (const territory of WORLD_MAP_DEFINITION.territories) {
      expect(CONTINENTS[territory.continentId]).toBeDefined();
    }
  });

  it("should only reference existing territories as neighbors", () => {
    const territoryIds = new Set(
      WORLD_MAP_DEFINITION.territories.map((territory) => territory.id),
    );

    for (const territory of WORLD_MAP_DEFINITION.territories) {
      for (const neighborId of territory.neighbors) {
        expect(territoryIds.has(neighborId)).toBe(true);
      }
    }
  });

  it("should keep neighbor relationships symmetric", () => {
    const territories = new Map(
      WORLD_MAP_DEFINITION.territories.map((territory) => [
        territory.id,
        territory,
      ]),
    );

    for (const territory of WORLD_MAP_DEFINITION.territories) {
      for (const neighborId of territory.neighbors) {
        expect(territories.get(neighborId)?.neighbors).toContain(territory.id);
      }
    }
  });
});

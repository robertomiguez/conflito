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

  it("models France and Spain as separate country territories", () => {
    const territories = new Map(
      WORLD_MAP_DEFINITION.territories.map((territory) => [
        territory.id,
        territory,
      ]),
    );

    expect(territories.get("country-fra")?.name).toBe("France");
    expect(territories.get("country-esp")?.name).toBe("Spain");
    expect(territories.get("country-fra")?.neighbors).toContain("country-esp");
    expect(territories.has("western-europe")).toBe(false);
  });

  it("uses the requested country count for each playable continent", () => {
    const counts = WORLD_MAP_DEFINITION.territories.reduce<Record<string, number>>(
      (result, territory) => ({
        ...result,
        [territory.continentId]: (result[territory.continentId] ?? 0) + 1,
      }),
      {},
    );

    expect(counts).toEqual({
      "south-america": 7,
      "north-america": 6,
      europe: 12,
      africa: 12,
      asia: 10,
      australia: 4,
    });
  });
});

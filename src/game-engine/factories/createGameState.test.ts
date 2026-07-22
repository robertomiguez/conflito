import { describe, it, expect } from "vitest";
import { createGameState } from "./createGameState";
import { WORLD_MAP_DEFINITION } from "../../constants/mapDefinition";
import { demoPlayers } from "../data/demoPlayers";
import { TurnPhase } from "../types/TurnPhase";

describe("createGameState", () => {
  it("should assign every territory to a player with one troop", () => {
    const game = createGameState(WORLD_MAP_DEFINITION, demoPlayers, 42);

    expect(Object.keys(game.territories)).toHaveLength(
      WORLD_MAP_DEFINITION.territories.length,
    );

    for (const territory of Object.values(game.territories)) {
      expect(territory.troops).toBe(1);
      expect(territory.ownerId).toMatch(/^player-[12]$/);
      expect(territory.continentId).toBeTruthy();
    }
  });

  it("should produce deterministic territory ownership for a fixed seed", () => {
    const gameA = createGameState(WORLD_MAP_DEFINITION, demoPlayers, 999);
    const gameB = createGameState(WORLD_MAP_DEFINITION, demoPlayers, 999);

    for (const territoryId of Object.keys(gameA.territories)) {
      expect(gameA.territories[territoryId].ownerId).toBe(
        gameB.territories[territoryId].ownerId,
      );
    }
  });

  it("should distribute starting territories evenly between two players", () => {
    const game = createGameState(WORLD_MAP_DEFINITION, demoPlayers, 42);
    const territoryCounts = demoPlayers.map(
      (player) =>
        Object.values(game.territories).filter(
          (territory) => territory.ownerId === player.id,
        ).length,
    );

    expect(
      Math.max(...territoryCounts) - Math.min(...territoryCounts),
    ).toBeLessThanOrEqual(1);
  });

  it("should avoid assigning any multi-territory continent to one player at start", () => {
    const game = createGameState(WORLD_MAP_DEFINITION, demoPlayers, 42);
    const continentIds = new Set(
      WORLD_MAP_DEFINITION.territories.map((territory) => territory.continentId),
    );

    for (const continentId of continentIds) {
      const continentTerritories = Object.values(game.territories).filter(
        (territory) => territory.continentId === continentId,
      );
      if (continentTerritories.length <= 1) continue;

      const owners = new Set(
        continentTerritories.map((territory) => territory.ownerId),
      );
      expect(owners.size).toBeGreaterThan(1);
    }
  });

  it("should start in reinforcement phase for the first player", () => {
    const game = createGameState(WORLD_MAP_DEFINITION, demoPlayers);

    expect(game.currentPlayerId).toBe(demoPlayers[0].id);
    expect(game.phase).toBe(TurnPhase.Reinforcement);
    expect(game.reinforcementsLeft).toBeGreaterThanOrEqual(3);
    expect(game.turnNumber).toBe(1);
    expect(game.hasFortified).toBe(false);
    expect(game.winnerId).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { TerritoryPathService } from "./TerritoryPathService";
import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";

describe("TerritoryPathService", () => {
  const createGame = (): GameState => ({
    id: "test",
    players: [
      { id: "player-1", name: "P1", color: "#000" },
      { id: "player-2", name: "P2", color: "#fff" },
    ],
    territories: {
      t1: { id: "t1", ownerId: "player-1", troops: 5, neighbors: ["t2"] },
      t2: { id: "t2", ownerId: "player-1", troops: 1, neighbors: ["t1", "t3"] },
      t3: { id: "t3", ownerId: "player-1", troops: 2, neighbors: ["t2"] },
      t4: { id: "t4", ownerId: "player-2", troops: 2, neighbors: ["t3"] },
    },
    currentPlayerId: "player-1",
    turnNumber: 1,
    phase: TurnPhase.Fortify,
    reinforcementsLeft: 0,
    seed: 1,
    hasFortified: false,
  });

  it("should return all reachable owned territories except the source", () => {
    const reachable = TerritoryPathService.getReachableOwnedTerritories(
      createGame(),
      "player-1",
      "t1",
    );

    expect(reachable).toEqual(["t2", "t3"]);
  });

  it("should not reach territories blocked by enemies", () => {
    const connected = TerritoryPathService.areConnected(
      createGame(),
      "player-1",
      "t1",
      "t4",
    );

    expect(connected).toBe(false);
  });
});

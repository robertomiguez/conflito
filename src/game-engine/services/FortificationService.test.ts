import { describe, it, expect } from "vitest";
import { FortificationService } from "./FortificationService";
import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";

describe("FortificationService", () => {
  const createMockGame = (
    territories: Record<
      string,
      { ownerId: string; troops: number; neighbors: string[] }
    >,
  ): GameState => {
    return {
      id: "test-game",
      players: [
        { id: "player-1", name: "Player 1", color: "blue" },
        { id: "player-2", name: "Player 2", color: "red" },
      ],
      territories: Object.fromEntries(
        Object.entries(territories).map(([id, t]) => [
          id,
          { id, ownerId: t.ownerId, troops: t.troops, neighbors: t.neighbors },
        ]),
      ),
      currentPlayerId: "player-1",
      turnNumber: 1,
      phase: TurnPhase.Fortify,
      reinforcementsLeft: 0,
      seed: 42,
      hasFortified: false,
    };
  };

  it("should successfully fortify between direct neighbors", () => {
    const game = createMockGame({
      t1: { ownerId: "player-1", troops: 5, neighbors: ["t2"] },
      t2: { ownerId: "player-1", troops: 2, neighbors: ["t1"] },
    });

    const result = FortificationService.execute(game, "player-1", "t1", "t2", 3);
    expect(result.success).toBe(true);
    expect(result.game?.territories["t1"].troops).toBe(2);
    expect(result.game?.territories["t2"].troops).toBe(5);
    expect(result.game?.hasFortified).toBe(true);
  });

  it("should successfully fortify through a chain of owned territories", () => {
    const game = createMockGame({
      t1: { ownerId: "player-1", troops: 5, neighbors: ["t2"] },
      t2: { ownerId: "player-1", troops: 1, neighbors: ["t1", "t3"] },
      t3: { ownerId: "player-1", troops: 2, neighbors: ["t2"] },
    });

    const result = FortificationService.execute(game, "player-1", "t1", "t3", 3);
    expect(result.success).toBe(true);
    expect(result.game?.territories["t1"].troops).toBe(2);
    expect(result.game?.territories["t3"].troops).toBe(5);
  });

  it("should fail if path is blocked by enemy territory", () => {
    const game = createMockGame({
      t1: { ownerId: "player-1", troops: 5, neighbors: ["t2"] },
      t2: { ownerId: "player-2", troops: 2, neighbors: ["t1", "t3"] }, // Enemy
      t3: { ownerId: "player-1", troops: 2, neighbors: ["t2"] },
    });

    const result = FortificationService.execute(game, "player-1", "t1", "t3", 3);
    expect(result.success).toBe(false);
    expect(result.error).toBe("TERRITORIES_NOT_CONNECTED");
  });

  it("should fail if trying to fortify a second time in the same turn", () => {
    const game = createMockGame({
      t1: { ownerId: "player-1", troops: 5, neighbors: ["t2"] },
      t2: { ownerId: "player-1", troops: 2, neighbors: ["t1"] },
    });
    game.hasFortified = true;

    const result = FortificationService.execute(game, "player-1", "t1", "t2", 3);
    expect(result.success).toBe(false);
    expect(result.error).toBe("ALREADY_FORTIFIED");
  });

  it("should fail if less than 1 troop is left behind", () => {
    const game = createMockGame({
      t1: { ownerId: "player-1", troops: 5, neighbors: ["t2"] },
      t2: { ownerId: "player-1", troops: 2, neighbors: ["t1"] },
    });

    // Moving 5 from a territory with 5 troops leaves 0 behind (invalid)
    const result = FortificationService.execute(game, "player-1", "t1", "t2", 5);
    expect(result.success).toBe(false);
    expect(result.error).toBe("INSUFFICIENT_TROOPS_TO_LEAVE_BEHIND");
  });
});

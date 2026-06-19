import { describe, it, expect } from "vitest";
import { VictoryService } from "./VictoryService";
import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";

describe("VictoryService", () => {
  const createMockGame = (
    territories: Record<string, string | null>,
  ): GameState => {
    return {
      id: "test-game",
      players: [
        { id: "player-1", name: "P1", color: "blue" },
        { id: "player-2", name: "P2", color: "red" },
      ],
      territories: Object.fromEntries(
        Object.entries(territories).map(([id, ownerId]) => [
          id,
          { id, ownerId, troops: 2, neighbors: [] },
        ]),
      ),
      currentPlayerId: "player-1",
      turnNumber: 1,
      phase: TurnPhase.Attack,
      reinforcementsLeft: 0,
      seed: 42,
      hasFortified: false,
    };
  };

  it("should declare victory when all territories are owned by a single player", () => {
    const game = createMockGame({
      t1: "player-1",
      t2: "player-1",
      t3: "player-1",
    });

    const result = VictoryService.evaluate(game);
    expect(result.gameOver).toBe(true);
    expect(result.winnerId).toBe("player-1");
  });

  it("should not declare victory when territories are owned by different players", () => {
    const game = createMockGame({
      t1: "player-1",
      t2: "player-2",
      t3: "player-1",
    });

    const result = VictoryService.evaluate(game);
    expect(result.gameOver).toBe(false);
    expect(result.winnerId).toBeNull();
  });

  it("should not declare victory if some territories are unowned (null)", () => {
    const game = createMockGame({
      t1: "player-1",
      t2: null,
      t3: "player-1",
    });

    const result = VictoryService.evaluate(game);
    expect(result.gameOver).toBe(false);
    expect(result.winnerId).toBeNull();
  });
});

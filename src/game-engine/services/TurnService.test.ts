import { describe, it, expect } from "vitest";
import { TurnService } from "./TurnService";
import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";

describe("TurnService", () => {
  const createMockGame = (
    currentPlayerId: string,
    players: { id: string; name: string }[],
    territories: Record<string, string | null>, // map of territoryId to ownerId
  ): GameState => {
    return {
      id: "test-game",
      players: players.map((p) => ({ id: p.id, name: p.name, color: "gray" })),
      territories: Object.fromEntries(
        Object.entries(territories).map(([id, ownerId]) => [
          id,
          { id, ownerId, troops: 2, neighbors: [] },
        ]),
      ),
      currentPlayerId,
      turnNumber: 1,
      phase: TurnPhase.Fortify,
      reinforcementsLeft: 0,
      seed: 42,
      hasFortified: false,
    };
  };

  it("should advance turn from player-1 to player-2 in a 2-player game", () => {
    const game = createMockGame(
      "player-1",
      [{ id: "player-1", name: "P1" }, { id: "player-2", name: "P2" }],
      { t1: "player-1", t2: "player-2" },
    );

    const nextState = TurnService.endTurn(game);
    expect(nextState.currentPlayerId).toBe("player-2");
    expect(nextState.turnNumber).toBe(1); // Still round 1
    expect(nextState.phase).toBe(TurnPhase.Reinforcement);
    expect(nextState.reinforcementsLeft).toBeGreaterThanOrEqual(3);
  });

  it("should wrap around and increment turn number", () => {
    const game = createMockGame(
      "player-2",
      [{ id: "player-1", name: "P1" }, { id: "player-2", name: "P2" }],
      { t1: "player-1", t2: "player-2" },
    );

    const nextState = TurnService.endTurn(game);
    expect(nextState.currentPlayerId).toBe("player-1");
    expect(nextState.turnNumber).toBe(2); // Increments to 2
  });

  it("should skip eliminated players", () => {
    const game = createMockGame(
      "player-1",
      [
        { id: "player-1", name: "P1" },
        { id: "player-2", name: "P2" },
        { id: "player-3", name: "P3" },
      ],
      {
        t1: "player-1",
        t2: "player-3",
        // player-2 has 0 territories and is eliminated
      },
    );

    const nextState = TurnService.endTurn(game);
    // Should skip player-2 and go straight to player-3
    expect(nextState.currentPlayerId).toBe("player-3");
    expect(nextState.turnNumber).toBe(1);
  });
});

import { describe, it, expect } from "vitest";
import { PhaseService } from "./PhaseService";
import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";

describe("PhaseService", () => {
  const createMockGame = (
    phase: TurnPhase,
    reinforcementsLeft: number,
  ): GameState => {
    return {
      id: "test-game",
      players: [
        { id: "player-1", name: "P1", color: "blue" },
        { id: "player-2", name: "P2", color: "red" },
      ],
      territories: {
        t1: { id: "t1", ownerId: "player-1", troops: 2, neighbors: [] },
        t2: { id: "t2", ownerId: "player-2", troops: 2, neighbors: [] },
      },
      currentPlayerId: "player-1",
      turnNumber: 1,
      phase,
      reinforcementsLeft,
      seed: 42,
      hasFortified: false,
    };
  };

  it("should fail transition from reinforcement to attack if reinforcements are left", () => {
    const game = createMockGame(TurnPhase.Reinforcement, 3);
    const result = PhaseService.next(game, "player-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("MUST_PLACE_ALL_REINFORCEMENTS");
  });

  it("should succeed transition from reinforcement to attack if 0 reinforcements left", () => {
    const game = createMockGame(TurnPhase.Reinforcement, 0);
    const result = PhaseService.next(game, "player-1");
    expect(result.success).toBe(true);
    expect(result.game?.phase).toBe(TurnPhase.Attack);
  });

  it("should transition from attack to fortify", () => {
    const game = createMockGame(TurnPhase.Attack, 0);
    const result = PhaseService.next(game, "player-1");
    expect(result.success).toBe(true);
    expect(result.game?.phase).toBe(TurnPhase.Fortify);
  });

  it("should end turn and reset on transition from fortify", () => {
    const game = createMockGame(TurnPhase.Fortify, 0);
    const result = PhaseService.next(game, "player-1");
    expect(result.success).toBe(true);
    expect(result.game?.currentPlayerId).toBe("player-2");
    expect(result.game?.phase).toBe(TurnPhase.Reinforcement);
    expect(result.game?.reinforcementsLeft).toBeGreaterThanOrEqual(3);
  });

  it("should fail transition if not the current player", () => {
    const game = createMockGame(TurnPhase.Attack, 0);
    const result = PhaseService.next(game, "player-2"); // player-2 is not active
    expect(result.success).toBe(false);
    expect(result.error).toBe("NOT_YOUR_TURN");
  });

  it("should fail transition when the game is over", () => {
    const game = {
      ...createMockGame(TurnPhase.Attack, 0),
      winnerId: "player-1",
    };
    const result = PhaseService.next(game, "player-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("GAME_ALREADY_OVER");
  });
});

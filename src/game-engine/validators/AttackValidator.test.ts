import { describe, it, expect } from "vitest";
import { AttackValidator } from "./AttackValidator";
import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";

describe("AttackValidator", () => {
  const createGame = (winnerId: string | null = null): GameState => ({
    id: "test",
    players: [
      { id: "player-1", name: "P1", color: "#000" },
      { id: "player-2", name: "P2", color: "#fff" },
    ],
    territories: {
      t1: { id: "t1", ownerId: "player-1", troops: 5, neighbors: ["t2"] },
      t2: { id: "t2", ownerId: "player-2", troops: 2, neighbors: ["t1"] },
    },
    currentPlayerId: "player-1",
    turnNumber: 1,
    phase: TurnPhase.Attack,
    reinforcementsLeft: 0,
    seed: 1,
    hasFortified: false,
    winnerId,
  });

  it("should reject attacks after the game is over", () => {
    const result = AttackValidator.validate(
      createGame("player-1"),
      "player-1",
      "t1",
      "t2",
      2,
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("GAME_ALREADY_OVER");
  });
});

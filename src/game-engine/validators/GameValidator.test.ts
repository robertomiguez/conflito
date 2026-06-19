import { describe, it, expect } from "vitest";
import { GameValidator } from "./GameValidator";
import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";

describe("GameValidator", () => {
  const baseGame: GameState = {
    id: "test",
    players: [{ id: "player-1", name: "P1", color: "#000" }],
    territories: {},
    currentPlayerId: "player-1",
    turnNumber: 1,
    phase: TurnPhase.Attack,
    reinforcementsLeft: 0,
    seed: 1,
    hasFortified: false,
    winnerId: null,
  };

  it("should detect an unfinished game", () => {
    expect(GameValidator.isGameOver(baseGame)).toBe(false);
    expect(GameValidator.validateNotGameOver(baseGame).valid).toBe(true);
  });

  it("should detect a finished game", () => {
    const finished = { ...baseGame, winnerId: "player-1" };

    expect(GameValidator.isGameOver(finished)).toBe(true);
    expect(GameValidator.validateNotGameOver(finished)).toEqual({
      valid: false,
      reason: "GAME_ALREADY_OVER",
    });
  });
});

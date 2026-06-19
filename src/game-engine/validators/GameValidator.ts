import type { GameState } from "../domain/GameState";
import type { ValidationResult } from "../types/ValidationResult";

export class GameValidator {
  static isGameOver(game: GameState): boolean {
    return game.winnerId != null;
  }

  static validateNotGameOver(game: GameState): ValidationResult {
    if (game.winnerId != null) {
      return {
        valid: false,
        reason: "GAME_ALREADY_OVER",
      };
    }

    return { valid: true };
  }
}

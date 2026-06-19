import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";
import type { ValidationResult } from "../types/ValidationResult";
import { GameValidator } from "./GameValidator";

export class ReinforcementValidator {
  static validate(
    game: GameState,
    playerId: string,
    territoryId: string,
    amount: number,
  ): ValidationResult {
    const gameOverCheck = GameValidator.validateNotGameOver(game);
    if (!gameOverCheck.valid) return gameOverCheck;

    if (game.phase !== TurnPhase.Reinforcement) {
      return {
        valid: false,
        reason: "NOT_REINFORCEMENT_PHASE",
      };
    }

    if (game.currentPlayerId !== playerId) {
      return {
        valid: false,
        reason: "NOT_YOUR_TURN",
      };
    }

    const territory = game.territories[territoryId];
    if (!territory) {
      return {
        valid: false,
        reason: "TERRITORY_NOT_FOUND",
      };
    }

    if (territory.ownerId !== playerId) {
      return {
        valid: false,
        reason: "TERRITORY_NOT_OWNED",
      };
    }

    if (amount <= 0) {
      return {
        valid: false,
        reason: "INVALID_AMOUNT",
      };
    }

    if (amount > game.reinforcementsLeft) {
      return {
        valid: false,
        reason: "INSUFFICIENT_REINFORCEMENTS",
      };
    }

    return {
      valid: true,
    };
  }
}

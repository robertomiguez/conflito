import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";
import type { ValidationResult } from "../types/ValidationResult";
import { GameValidator } from "./GameValidator";
import { TerritoryPathService } from "../services/TerritoryPathService";

export class FortifyValidator {
  static validate(
    game: GameState,
    playerId: string,
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number,
  ): ValidationResult {
    const gameOverCheck = GameValidator.validateNotGameOver(game);
    if (!gameOverCheck.valid) return gameOverCheck;

    if (game.phase !== TurnPhase.Fortify) {
      return {
        valid: false,
        reason: "NOT_FORTIFY_PHASE",
      };
    }

    if (game.currentPlayerId !== playerId) {
      return {
        valid: false,
        reason: "NOT_YOUR_TURN",
      };
    }

    if (game.hasFortified) {
      return {
        valid: false,
        reason: "ALREADY_FORTIFIED",
      };
    }

    const from = game.territories[fromTerritoryId];
    const to = game.territories[toTerritoryId];

    if (!from || !to) {
      return {
        valid: false,
        reason: "TERRITORY_NOT_FOUND",
      };
    }

    if (from.ownerId !== playerId || to.ownerId !== playerId) {
      return {
        valid: false,
        reason: "TERRITORIES_NOT_OWNED",
      };
    }

    if (fromTerritoryId === toTerritoryId) {
      return {
        valid: false,
        reason: "CANNOT_FORTIFY_SAME_TERRITORY",
      };
    }

    if (troops <= 0) {
      return {
        valid: false,
        reason: "INVALID_TROOPS_COUNT",
      };
    }

    if (from.troops - troops < 1) {
      return {
        valid: false,
        reason: "INSUFFICIENT_TROOPS_TO_LEAVE_BEHIND",
      };
    }

    if (
      !TerritoryPathService.areConnected(
        game,
        playerId,
        fromTerritoryId,
        toTerritoryId,
      )
    ) {
      return {
        valid: false,
        reason: "TERRITORIES_NOT_CONNECTED",
      };
    }

    return {
      valid: true,
    };
  }
}

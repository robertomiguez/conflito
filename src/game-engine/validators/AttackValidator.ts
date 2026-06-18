import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";
import type { ValidationResult } from "../types/ValidationResult";

export class AttackValidator {
  static validate(
    game: GameState,
    playerId: string,
    fromTerritoryId: string,
    toTerritoryId: string,
  ): ValidationResult {
    if (game.phase !== TurnPhase.Attack) {
      return {
        valid: false,
        reason: "Not attack phase",
      };
    }

    const from = game.territories[fromTerritoryId];

    const to = game.territories[toTerritoryId];

    if (!from || !to) {
      return {
        valid: false,
        reason: "Territory not found",
      };
    }

    if (from.ownerId !== playerId) {
      return {
        valid: false,
        reason: "Player does not own source territory",
      };
    }

    if (to.ownerId === playerId) {
      return {
        valid: false,
        reason: "Cannot attack own territory",
      };
    }

    if (!from.neighbors.includes(to.id)) {
      return {
        valid: false,
        reason: "Territories are not neighbors",
      };
    }

    if (from.troops < 2) {
      return {
        valid: false,
        reason: "Not enough troops",
      };
    }

    return {
      valid: true,
    };
  }
}

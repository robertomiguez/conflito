import type { GameState } from "../domain/GameState";
import { FortifyValidator } from "../validators/FortifyValidator";

export interface FortifyResult {
  success: boolean;
  game?: GameState;
  error?: string;
}

export class FortificationService {
  /**
   * Moves troops from one owned territory to another through connected owned territories.
   * Enforces that this can only be done once per turn.
   */
  static execute(
    game: GameState,
    playerId: string,
    fromTerritoryId: string,
    toTerritoryId: string,
    troops: number,
  ): FortifyResult {
    const validation = FortifyValidator.validate(
      game,
      playerId,
      fromTerritoryId,
      toTerritoryId,
      troops,
    );

    if (!validation.valid) {
      return {
        success: false,
        error: validation.reason,
      };
    }

    const from = game.territories[fromTerritoryId];
    const to = game.territories[toTerritoryId];

    const updatedGame: GameState = {
      ...game,
      hasFortified: true,
      territories: {
        ...game.territories,
        [fromTerritoryId]: {
          ...from,
          troops: from.troops - troops,
        },
        [toTerritoryId]: {
          ...to,
          troops: to.troops + troops,
        },
      },
    };

    return {
      success: true,
      game: updatedGame,
    };
  }
}

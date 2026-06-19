import type { GameState } from "../domain/GameState";
import type { VictoryResult } from "../types/VictoryResult";

export class VictoryService {
  /**
   * Evaluates if a player has achieved victory by conquering every territory on the map.
   */
  static evaluate(game: GameState): VictoryResult {
    const territories = Object.values(game.territories);

    if (territories.length === 0) {
      return {
        gameOver: false,
        winnerId: null,
      };
    }

    const nonNullOwners = new Set(
      territories
        .map((t) => t.ownerId)
        .filter((ownerId): ownerId is string => ownerId !== null),
    );

    const hasUnowned = territories.some((t) => t.ownerId === null);

    if (nonNullOwners.size === 1 && !hasUnowned) {
      return {
        gameOver: true,
        winnerId: [...nonNullOwners][0],
      };
    }

    return {
      gameOver: false,
      winnerId: null,
    };
  }
}

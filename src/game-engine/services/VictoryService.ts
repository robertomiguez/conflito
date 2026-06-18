import type { GameState } from "../domain/GameState";
import type { VictoryResult } from "../types/VictoryResult";

export class VictoryService {
  static evaluate(game: GameState): VictoryResult {
    const owners = new Set(
      Object.values(game.territories).map((t) => t.ownerId),
    );

    if (owners.size === 1) {
      return {
        gameOver: true,
        winnerId: [...owners][0],
      };
    }

    return {
      gameOver: false,
      winnerId: null,
    };
  }
}

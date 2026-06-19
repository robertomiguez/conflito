import type { GameState } from "../domain/GameState";
import { ReinforcementService } from "./ReinforcementService";
import { TurnPhase } from "../types/TurnPhase";

export class TurnService {
  static getCurrentPlayer(game: GameState) {
    return game.players.find((player) => player.id === game.currentPlayerId);
  }

  static endTurn(game: GameState): GameState {
    const currentIndex = game.players.findIndex(
      (player) => player.id === game.currentPlayerId,
    );

    // Find the next active player who owns at least one territory
    let nextIndex = currentIndex;
    let foundNext = false;

    for (let i = 1; i <= game.players.length; i++) {
      const idx = (currentIndex + i) % game.players.length;
      const player = game.players[idx];

      const ownsAny = Object.values(game.territories).some(
        (t) => t.ownerId === player.id,
      );

      if (ownsAny) {
        nextIndex = idx;
        foundNext = true;
        break;
      }
    }

    const nextPlayerId = foundNext
      ? game.players[nextIndex].id
      : game.currentPlayerId;

    // Increment turn number when the index wraps around to a lower or equal value
    const turnNumber =
      nextIndex <= currentIndex ? game.turnNumber + 1 : game.turnNumber;

    const nextState: GameState = {
      ...game,
      currentPlayerId: nextPlayerId,
      turnNumber,
      phase: TurnPhase.Reinforcement,
      hasFortified: false,
      reinforcementsLeft: 0,
    };

    // Calculate reinforcements for the new player
    nextState.reinforcementsLeft = ReinforcementService.calculate(
      nextState,
      nextPlayerId,
    );

    return nextState;
  }
}

import type { GameState } from "../domain/GameState";

export class TurnService {
  static getCurrentPlayer(game: GameState) {
    return game.players.find((player) => player.id === game.currentPlayerId);
  }

  static endTurn(game: GameState): GameState {
    const currentIndex = game.players.findIndex(
      (player) => player.id === game.currentPlayerId,
    );

    const nextIndex = (currentIndex + 1) % game.players.length;

    return {
      ...game,
      currentPlayerId: game.players[nextIndex].id,

      turnNumber: nextIndex === 0 ? game.turnNumber + 1 : game.turnNumber,
    };
  }
}

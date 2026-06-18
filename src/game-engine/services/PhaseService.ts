import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";
import { TurnService } from "./TurnService";

export class PhaseService {
  static next(game: GameState): GameState {
    switch (game.phase) {
      case TurnPhase.Reinforcement:
        return {
          ...game,
          phase: TurnPhase.Attack,
        };

      case TurnPhase.Attack:
        return {
          ...game,
          phase: TurnPhase.Fortify,
        };

      case TurnPhase.Fortify: {
        const nextGame = TurnService.endTurn(game);

        return {
          ...nextGame,
          phase: TurnPhase.Reinforcement,
        };
      }

      default:
        return game;
    }
  }
}

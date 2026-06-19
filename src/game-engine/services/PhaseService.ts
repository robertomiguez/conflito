import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";
import { GameValidator } from "../validators/GameValidator";
import { TurnService } from "./TurnService";

export interface PhaseTransitionResult {
  success: boolean;
  game?: GameState;
  error?: string;
}

export class PhaseService {
  /**
   * Transitions the game to the next phase in the turn cycle:
   * Reinforcement -> Attack -> Fortify -> (End turn, starts Reinforcement for next player).
   * Enforces that all reinforcement troops must be placed before attacking.
   */
  static next(game: GameState, playerId: string): PhaseTransitionResult {
    const gameOverCheck = GameValidator.validateNotGameOver(game);
    if (!gameOverCheck.valid) {
      return {
        success: false,
        error: gameOverCheck.reason,
      };
    }

    if (game.currentPlayerId !== playerId) {
      return {
        success: false,
        error: "NOT_YOUR_TURN",
      };
    }

    switch (game.phase) {
      case TurnPhase.Reinforcement: {
        if (game.reinforcementsLeft > 0) {
          return {
            success: false,
            error: "MUST_PLACE_ALL_REINFORCEMENTS",
          };
        }

        return {
          success: true,
          game: {
            ...game,
            phase: TurnPhase.Attack,
          },
        };
      }

      case TurnPhase.Attack:
        return {
          success: true,
          game: {
            ...game,
            phase: TurnPhase.Fortify,
          },
        };

      case TurnPhase.Fortify: {
        const nextGame = TurnService.endTurn(game);
        return {
          success: true,
          game: nextGame,
        };
      }

      default:
        return {
          success: true,
          game,
        };
    }
  }
}

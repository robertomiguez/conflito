import type { GameState } from "../domain/GameState";
import type { BattleResult } from "../types/BattleResult";
import { AttackValidator } from "../validators/AttackValidator";
import { DiceService } from "./DiceService";
import { RandomService } from "./RandomService";
import { VictoryService } from "./VictoryService";

export interface AttackExecutionResult {
  success: boolean;
  error?: string;
  game?: GameState;
  battle?: BattleResult;
  territoryCaptured?: boolean;
}

export class AttackService {
  /**
   * Executes an attack from one territory to another.
   * Uses seedable randomness from the game state to resolve dice rolls.
   */
  static execute(
    game: GameState,
    playerId: string,
    fromTerritoryId: string,
    toTerritoryId: string,
    attackerDice: number,
    troopsToMove?: number,
  ): AttackExecutionResult {
    const validation = AttackValidator.validate(
      game,
      playerId,
      fromTerritoryId,
      toTerritoryId,
      attackerDice,
    );

    if (!validation.valid) {
      return {
        success: false,
        error: validation.reason,
      };
    }

    const from = game.territories[fromTerritoryId];
    const to = game.territories[toTerritoryId];

    // If a capture occurs, validate the custom relocated troops count
    if (troopsToMove !== undefined) {
      if (troopsToMove < attackerDice || troopsToMove >= from.troops) {
        return {
          success: false,
          error: "INVALID_TROOPS_TO_MOVE",
        };
      }
    }

    const defenderDice = Math.min(2, to.troops);

    // Seedable dice resolution
    const randomService = new RandomService(game.seed);
    const battle = DiceService.resolveBattle(
      attackerDice,
      defenderDice,
      randomService,
    );
    const nextSeed = randomService.getSeed();

    const fromAfterBattleTroops = from.troops - battle.attackerLosses;
    const toAfterBattleTroops = to.troops - battle.defenderLosses;

    let updatedFrom = {
      ...from,
      troops: fromAfterBattleTroops,
    };

    let updatedTo = {
      ...to,
      troops: toAfterBattleTroops,
    };

    let territoryCaptured = false;

    if (toAfterBattleTroops <= 0) {
      territoryCaptured = true;
      const actualMove =
        troopsToMove !== undefined ? troopsToMove : attackerDice;

      updatedTo = {
        ...to,
        ownerId: playerId,
        troops: actualMove,
      };

      updatedFrom = {
        ...from,
        troops: fromAfterBattleTroops - actualMove,
      };
    }

    let updatedGame: GameState = {
      ...game,
      seed: nextSeed,
      territories: {
        ...game.territories,
        [from.id]: updatedFrom,
        [to.id]: updatedTo,
      },
    };

    // Evaluate victory
    const victory = VictoryService.evaluate(updatedGame);
    if (victory.gameOver) {
      updatedGame = {
        ...updatedGame,
        winnerId: victory.winnerId,
      };
    }

    return {
      success: true,
      game: updatedGame,
      battle,
      territoryCaptured,
    };
  }
}

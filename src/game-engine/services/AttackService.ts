import type { GameState } from "../domain/GameState";
import type { AttackResult } from "../types/AttackResult";

import { AttackValidator } from "../validators";

import { DiceService } from "./DiceService";
import { CaptureService } from "./CaptureService";

export class AttackService {
  static execute(
    game: GameState,
    playerId: string,
    fromTerritoryId: string,
    toTerritoryId: string,
  ): AttackResult {
    const validation = AttackValidator.validate(
      game,
      playerId,
      fromTerritoryId,
      toTerritoryId,
    );

    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const from = game.territories[fromTerritoryId];

    const to = game.territories[toTerritoryId];

    const attackerDice = Math.min(3, from.troops - 1);

    const defenderDice = Math.min(2, to.troops);

    const battle = DiceService.resolveBattle(attackerDice, defenderDice);

    const updatedFrom = {
      ...from,
      troops: from.troops - battle.attackerLosses,
    };

    const updatedTo = {
      ...to,
      troops: to.troops - battle.defenderLosses,
    };

    let territoryCaptured = false;

    if (updatedTo.troops <= 0) {
      territoryCaptured = true;

      const captured = CaptureService.capture(updatedFrom, updatedTo, playerId);

      Object.assign(updatedFrom, captured.from);

      Object.assign(updatedTo, captured.to);
    }

    const updatedGame: GameState = {
      ...game,

      territories: {
        ...game.territories,

        [from.id]: updatedFrom,

        [to.id]: updatedTo,
      },
    };

    return {
      game: updatedGame,
      battle,
      territoryCaptured,
    };
  }
}

import type { BattleResult } from "../types/BattleResult";
import type { RandomService } from "./RandomService";

export class DiceService {
  static resolveBattle(
    attackerDice: number,
    defenderDice: number,
    randomService: RandomService,
  ): BattleResult {
    if (attackerDice < 1 || attackerDice > 3) {
      throw new Error("Invalid attacker dice");
    }

    if (defenderDice < 1 || defenderDice > 2) {
      throw new Error("Invalid defender dice");
    }

    const attackerRolls = Array.from({ length: attackerDice }, () =>
      randomService.rollDie(),
    ).sort((a, b) => b - a);

    const defenderRolls = Array.from({ length: defenderDice }, () =>
      randomService.rollDie(),
    ).sort((a, b) => b - a);

    let attackerLosses = 0;
    let defenderLosses = 0;

    const comparisons = Math.min(attackerRolls.length, defenderRolls.length);

    for (let i = 0; i < comparisons; i++) {
      if (attackerRolls[i] > defenderRolls[i]) {
        defenderLosses++;
      } else {
        attackerLosses++;
      }
    }

    return {
      attackerRolls,
      defenderRolls,
      attackerLosses,
      defenderLosses,
    };
  }
}

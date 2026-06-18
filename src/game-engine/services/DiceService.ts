import type { BattleResult } from "../types/BattleResult";

function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export class DiceService {
  static resolveBattle(
    attackerDice: number,
    defenderDice: number,
  ): BattleResult {
    if (attackerDice < 1 || attackerDice > 3) {
      throw new Error("Invalid attacker dice");
    }

    if (defenderDice < 1 || defenderDice > 2) {
      throw new Error("Invalid defender dice");
    }

    const attackerRolls = Array.from({ length: attackerDice }, () =>
      rollDice(),
    ).sort((a, b) => b - a);

    const defenderRolls = Array.from({ length: defenderDice }, () =>
      rollDice(),
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

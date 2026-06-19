import { describe, it, expect } from "vitest";
import { DiceService } from "./DiceService";
import { RandomService } from "./RandomService";

describe("DiceService", () => {
  it("should resolve battle correctly based on rolls", () => {
    // We mock rolls by configuring seed or checking results
    // Let's use a known seed that gives specific rolls
    // service.rollDie() outputs can be checked
    const service = new RandomService(42);
    // Let's roll a few times to see
    const roll1 = service.rollDie();
    const roll2 = service.rollDie();

    // Reset service to same state to test resolveBattle
    const testService = new RandomService(42);
    const result = DiceService.resolveBattle(1, 1, testService);

    expect(result.attackerRolls.length).toBe(1);
    expect(result.defenderRolls.length).toBe(1);
    expect(result.attackerRolls[0]).toBe(roll1);
    expect(result.defenderRolls[0]).toBe(roll2);

    if (roll1 > roll2) {
      expect(result.defenderLosses).toBe(1);
      expect(result.attackerLosses).toBe(0);
    } else {
      expect(result.defenderLosses).toBe(0);
      expect(result.attackerLosses).toBe(1);
    }
  });

  it("should compare descending sorted rolls correctly", () => {
    // We can verify that defender wins ties
    // and higher rolls win.
    // Let's find seeds or mock RandomService if we want, or just test logic.
    // Let's test with a seed that gives specific outputs, or simply check sorting
    const service = new RandomService(999);
    const result = DiceService.resolveBattle(3, 2, service);

    // Assert that rolls are sorted descending
    expect(result.attackerRolls[0]).toBeGreaterThanOrEqual(result.attackerRolls[1]);
    expect(result.attackerRolls[1]).toBeGreaterThanOrEqual(result.attackerRolls[2]);
    expect(result.defenderRolls[0]).toBeGreaterThanOrEqual(result.defenderRolls[1]);

    // Manually calculate losses from the actual rolls
    let expectedAttackerLosses = 0;
    let expectedDefenderLosses = 0;
    if (result.attackerRolls[0] > result.defenderRolls[0]) {
      expectedDefenderLosses++;
    } else {
      expectedAttackerLosses++;
    }
    if (result.attackerRolls[1] > result.defenderRolls[1]) {
      expectedDefenderLosses++;
    } else {
      expectedAttackerLosses++;
    }

    expect(result.attackerLosses).toBe(expectedAttackerLosses);
    expect(result.defenderLosses).toBe(expectedDefenderLosses);
  });
});

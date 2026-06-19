import { describe, it, expect } from "vitest";
import { AttackService } from "./AttackService";
import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";

describe("AttackService", () => {
  const createMockGame = (
    territories: Record<
      string,
      { ownerId: string; troops: number; neighbors: string[] }
    >,
  ): GameState => {
    return {
      id: "test-game",
      players: [
        { id: "player-1", name: "Player 1", color: "blue" },
        { id: "player-2", name: "Player 2", color: "red" },
      ],
      territories: Object.fromEntries(
        Object.entries(territories).map(([id, t]) => [
          id,
          { id, ownerId: t.ownerId, troops: t.troops, neighbors: t.neighbors },
        ]),
      ),
      currentPlayerId: "player-1",
      turnNumber: 1,
      phase: TurnPhase.Attack,
      reinforcementsLeft: 0,
      seed: 42, // Fix seed for deterministic rolls
      hasFortified: false,
    };
  };

  it("should fail attack if not in attack phase", () => {
    const game = createMockGame({
      from: { ownerId: "player-1", troops: 5, neighbors: ["to"] },
      to: { ownerId: "player-2", troops: 3, neighbors: ["from"] },
    });
    game.phase = TurnPhase.Reinforcement;

    const result = AttackService.execute(game, "player-1", "from", "to", 3);
    expect(result.success).toBe(false);
    expect(result.error).toBe("NOT_ATTACK_PHASE");
  });

  it("should fail attack if insufficient troops", () => {
    const game = createMockGame({
      from: { ownerId: "player-1", troops: 1, neighbors: ["to"] },
      to: { ownerId: "player-2", troops: 3, neighbors: ["from"] },
    });

    const result = AttackService.execute(game, "player-1", "from", "to", 1);
    expect(result.success).toBe(false);
    expect(result.error).toBe("INSUFFICIENT_TROOPS");
  });

  it("should resolve battle, decrease troops, and advance seed", () => {
    const game = createMockGame({
      from: { ownerId: "player-1", troops: 5, neighbors: ["to"] },
      to: { ownerId: "player-2", troops: 3, neighbors: ["from"] },
    });

    const result = AttackService.execute(game, "player-1", "from", "to", 3);
    expect(result.success).toBe(true);
    expect(result.battle).toBeDefined();
    expect(result.game?.seed).not.toBe(game.seed);

    const fromTroops = result.game?.territories["from"].troops ?? 0;
    const toTroops = result.game?.territories["to"].troops ?? 0;

    // Troops after battle should equal original minus battle losses
    const attackerLosses = result.battle?.attackerLosses ?? 0;
    const defenderLosses = result.battle?.defenderLosses ?? 0;

    if (result.territoryCaptured) {
      expect(toTroops).toBe(3); // Minimum troops moved = 3 (attackerDice)
      expect(fromTroops).toBe(5 - attackerLosses - 3);
    } else {
      expect(fromTroops).toBe(5 - attackerLosses);
      expect(toTroops).toBe(3 - defenderLosses);
    }
  });

  it("should capture territory and relocate armies when defender defeated", () => {
    const game = createMockGame({
      from: { ownerId: "player-1", troops: 10, neighbors: ["to"] },
      to: { ownerId: "player-2", troops: 1, neighbors: ["from"] },
    });

    // With 1 defender, maximum defender losses is 1, causing capture
    const result = AttackService.execute(
      game,
      "player-1",
      "from",
      "to",
      3,
      5, // Relocate 5 troops upon capture
    );

    expect(result.success).toBe(true);
    expect(result.territoryCaptured).toBe(true);
    expect(result.game?.territories["to"].ownerId).toBe("player-1");
    expect(result.game?.territories["to"].troops).toBe(5);
    // Attacker losses: resolveBattle is mockable but here it's run. Let's verify formula:
    const losses = result.battle?.attackerLosses ?? 0;
    expect(result.game?.territories["from"].troops).toBe(10 - losses - 5);
  });

  it("should trigger victory when all territories captured by a player", () => {
    const game = createMockGame({
      from: { ownerId: "player-1", troops: 5, neighbors: ["to"] },
      to: { ownerId: "player-2", troops: 1, neighbors: ["from"] },
    });

    const result = AttackService.execute(game, "player-1", "from", "to", 3);
    expect(result.success).toBe(true);
    expect(result.territoryCaptured).toBe(true);
    expect(result.game?.winnerId).toBe("player-1");
  });
});

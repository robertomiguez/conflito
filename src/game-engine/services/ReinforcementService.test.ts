import { describe, it, expect } from "vitest";
import { ReinforcementService } from "./ReinforcementService";
import type { GameState } from "../domain/GameState";
import { TurnPhase } from "../types/TurnPhase";

describe("ReinforcementService", () => {
  const createMockGame = (
    territories: Record<
      string,
      {
        ownerId: string;
        troops: number;
        neighbors: string[];
        continentId?: string;
      }
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
          {
            id,
            ownerId: t.ownerId,
            troops: t.troops,
            neighbors: t.neighbors,
            continentId: t.continentId,
          },
        ]),
      ),
      currentPlayerId: "player-1",
      turnNumber: 1,
      phase: TurnPhase.Reinforcement,
      reinforcementsLeft: 5,
      seed: 12345,
      hasFortified: false,
    };
  };

  it("should calculate minimum of 3 reinforcements for small territory count", () => {
    const game = createMockGame({
      t1: { ownerId: "player-1", troops: 1, neighbors: [] },
      t2: { ownerId: "player-1", troops: 1, neighbors: [] },
      t3: { ownerId: "player-2", troops: 1, neighbors: [] },
    });

    const troops = ReinforcementService.calculate(game, "player-1");
    expect(troops).toBe(3);
  });

  it("should calculate divisions of 3 for larger territory count", () => {
    const territories: Record<
      string,
      { ownerId: string; troops: number; neighbors: string[] }
    > = {};
    for (let i = 0; i < 11; i++) {
      territories[`t${i}`] = { ownerId: "player-1", troops: 1, neighbors: [] };
    }
    const game = createMockGame(territories);

    const troops = ReinforcementService.calculate(game, "player-1");
    expect(troops).toBe(3); // 11 / 3 = 3.66 -> Math.floor is 3

    // 12 territories
    territories["t11"] = { ownerId: "player-1", troops: 1, neighbors: [] };
    const game2 = createMockGame(territories);
    expect(ReinforcementService.calculate(game2, "player-1")).toBe(4);
  });

  it("should apply continent bonuses correctly", () => {
    // South America uses the current adjusted continent bonus (+4).
    const game = createMockGame({
      venezuela: {
        ownerId: "player-1",
        troops: 1,
        neighbors: [],
        continentId: "south-america",
      },
      peru: {
        ownerId: "player-1",
        troops: 1,
        neighbors: [],
        continentId: "south-america",
      },
      brazil: {
        ownerId: "player-1",
        troops: 1,
        neighbors: [],
        continentId: "south-america",
      },
      argentina: {
        ownerId: "player-1",
        troops: 1,
        neighbors: [],
        continentId: "south-america",
      },
    });

    // 4 territories -> base 3. Continent bonus +4 -> total 7.
    const troops = ReinforcementService.calculate(game, "player-1");
    expect(troops).toBe(7);
  });

  it("should reinforce a territory when valid", () => {
    const game = createMockGame({
      t1: { ownerId: "player-1", troops: 1, neighbors: [] },
    });

    const result = ReinforcementService.reinforce(game, "player-1", "t1", 3);
    expect(result.success).toBe(true);
    expect(result.game?.territories["t1"].troops).toBe(4);
    expect(result.game?.reinforcementsLeft).toBe(2);
  });

  it("should fail reinforcement when not owned", () => {
    const game = createMockGame({
      t1: { ownerId: "player-2", troops: 1, neighbors: [] },
    });

    const result = ReinforcementService.reinforce(game, "player-1", "t1", 3);
    expect(result.success).toBe(false);
    expect(result.error).toBe("TERRITORY_NOT_OWNED");
  });

  it("should fail reinforcement when amount exceeds reinforcementsLeft", () => {
    const game = createMockGame({
      t1: { ownerId: "player-1", troops: 1, neighbors: [] },
    });

    const result = ReinforcementService.reinforce(game, "player-1", "t1", 10);
    expect(result.success).toBe(false);
    expect(result.error).toBe("INSUFFICIENT_REINFORCEMENTS");
  });
});

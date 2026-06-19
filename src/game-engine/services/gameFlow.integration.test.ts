import { describe, it, expect } from "vitest";
import { createGameState } from "../factories/createGameState";
import { WORLD_MAP_DEFINITION } from "../../constants/mapDefinition";
import { demoPlayers } from "../data/demoPlayers";
import { ReinforcementService } from "./ReinforcementService";
import { PhaseService } from "./PhaseService";
import { AttackService } from "./AttackService";
import { TurnPhase } from "../types/TurnPhase";
import { VictoryService } from "./VictoryService";
import type { GameState } from "../domain/GameState";

describe("game flow integration", () => {
  it("should run a full turn cycle and block actions after victory", () => {
    let game = createGameState(WORLD_MAP_DEFINITION, demoPlayers, 42);

    const ownedTerritory = Object.values(game.territories).find(
      (t) => t.ownerId === game.currentPlayerId,
    )!;
    const amount = game.reinforcementsLeft;

    const reinforceResult = ReinforcementService.reinforce(
      game,
      game.currentPlayerId,
      ownedTerritory.id,
      amount,
    );
    expect(reinforceResult.success).toBe(true);
    game = reinforceResult.game!;

    let phaseResult = PhaseService.next(game, game.currentPlayerId);
    expect(phaseResult.success).toBe(true);
    expect(phaseResult.game?.phase).toBe(TurnPhase.Attack);
    game = phaseResult.game!;

    phaseResult = PhaseService.next(game, game.currentPlayerId);
    expect(phaseResult.success).toBe(true);
    expect(phaseResult.game?.phase).toBe(TurnPhase.Fortify);
    game = phaseResult.game!;

    phaseResult = PhaseService.next(game, game.currentPlayerId);
    expect(phaseResult.success).toBe(true);
    expect(phaseResult.game?.currentPlayerId).toBe("player-2");
    game = phaseResult.game!;
  });

  it("should declare a winner when one player owns all territories", () => {
    const game: GameState = {
      id: "test",
      players: demoPlayers,
      territories: Object.fromEntries(
        WORLD_MAP_DEFINITION.territories.map((t) => [
          t.id,
          {
            id: t.id,
            ownerId: "player-1",
            troops: 1,
            neighbors: t.neighbors,
            continentId: t.continentId,
          },
        ]),
      ),
      currentPlayerId: "player-1",
      turnNumber: 1,
      phase: TurnPhase.Attack,
      reinforcementsLeft: 0,
      seed: 1,
      hasFortified: false,
      winnerId: null,
    };

    const victory = VictoryService.evaluate(game);
    expect(victory.gameOver).toBe(true);
    expect(victory.winnerId).toBe("player-1");

    const blocked = PhaseService.next(
      { ...game, winnerId: victory.winnerId },
      "player-1",
    );
    expect(blocked.success).toBe(false);
    expect(blocked.error).toBe("GAME_ALREADY_OVER");
  });

  it("should reject attacks once winnerId is set", () => {
    const game: GameState = {
      id: "test",
      players: demoPlayers,
      territories: {
        t1: { id: "t1", ownerId: "player-1", troops: 5, neighbors: ["t2"] },
        t2: { id: "t2", ownerId: "player-2", troops: 1, neighbors: ["t1"] },
      },
      currentPlayerId: "player-1",
      turnNumber: 1,
      phase: TurnPhase.Attack,
      reinforcementsLeft: 0,
      seed: 1,
      hasFortified: false,
      winnerId: "player-1",
    };

    const result = AttackService.execute(game, "player-1", "t1", "t2", 2);
    expect(result.success).toBe(false);
    expect(result.error).toBe("GAME_ALREADY_OVER");
  });
});

import type { GameState } from "../domain/GameState";
import type { Player } from "../domain/Player";
import type { MapDefinition } from "../types";
import { TurnPhase } from "../types";
import { ReinforcementService } from "../services/ReinforcementService";
import { RandomService } from "../services/RandomService";

export const createGameState = (
  map: MapDefinition,
  players: Player[],
  seed = 12345,
): GameState => {
  const random = new RandomService(seed);
  const shuffledTerritories = [...map.territories];

  for (let i = shuffledTerritories.length - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1));
    [shuffledTerritories[i], shuffledTerritories[j]] = [
      shuffledTerritories[j],
      shuffledTerritories[i],
    ];
  }

  const territories = Object.fromEntries(
    shuffledTerritories.map((territory, index) => {
      const owner = players[index % players.length];

      return [
        territory.id,
        {
          id: territory.id,
          ownerId: owner.id,
          troops: 1,
          neighbors: territory.neighbors,
          continentId: territory.continentId,
        },
      ];
    }),
  );

  const initialPlayerId = players[0].id;

  const tempState: GameState = {
    id: crypto.randomUUID(),
    players,
    territories,
    currentPlayerId: initialPlayerId,
    turnNumber: 1,
    phase: TurnPhase.Reinforcement,
    reinforcementsLeft: 0,
    seed: random.getSeed(),
    hasFortified: false,
    winnerId: null,
  };

  tempState.reinforcementsLeft = ReinforcementService.calculate(
    tempState,
    initialPlayerId,
  );

  return tempState;
};

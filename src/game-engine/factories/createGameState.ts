import type { GameState } from "../domain/GameState";
import type { Player } from "../domain/Player";
import type { MapDefinition } from "../types";
import { TurnPhase } from "../types";
import { ReinforcementService } from "../services/ReinforcementService";
import { RandomService } from "../services/RandomService";

function createRandomSeed(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] || 1;
}

function shuffle<T>(items: T[], random: RandomService): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const createGameState = (
  map: MapDefinition,
  players: Player[],
  seed = createRandomSeed(),
): GameState => {
  const random = new RandomService(seed);
  const territoriesByContinent = new Map<string, typeof map.territories>();
  for (const territory of map.territories) {
    const continentId = territory.continentId ?? "__unassigned__";
    const territories = territoriesByContinent.get(continentId) ?? [];
    territories.push(territory);
    territoriesByContinent.set(continentId, territories);
  }

  const ownerCounts = new Map(players.map((player) => [player.id, 0]));
  const territoryOwners = new Map<string, Player>();

  for (const continentId of shuffle(
    Array.from(territoriesByContinent.keys()),
    random,
  )) {
    const shuffledTerritories = shuffle(
      territoriesByContinent.get(continentId) ?? [],
      random,
    );
    const playerOrder = shuffle(players, random).sort(
      (a, b) => (ownerCounts.get(a.id) ?? 0) - (ownerCounts.get(b.id) ?? 0),
    );

    for (const [index, territory] of shuffledTerritories.entries()) {
      const owner = playerOrder[index % playerOrder.length];
      territoryOwners.set(territory.id, owner);
      ownerCounts.set(owner.id, (ownerCounts.get(owner.id) ?? 0) + 1);
    }
  }

  const territories = Object.fromEntries(
    map.territories.map((territory) => {
      const owner = territoryOwners.get(territory.id);
      if (!owner) {
        throw new Error(`No owner assigned for territory ${territory.id}`);
      }

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

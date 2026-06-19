import type { GameState } from "../domain/GameState";
import { CONTINENTS } from "../constants/continents";
import { ReinforcementValidator } from "../validators/ReinforcementValidator";

export interface ReinforceResult {
  success: boolean;
  game?: GameState;
  error?: string;
}

export class ReinforcementService {
  /**
   * Calculates the total reinforcements allowed for a player based on owned territories
   * and fully controlled continents.
   */
  static calculate(game: GameState, playerId: string): number {
    const ownedTerritories = Object.values(game.territories).filter(
      (territory) => territory.ownerId === playerId,
    );

    let troops = Math.max(3, Math.floor(ownedTerritories.length / 3));

    const continentGroups: Record<string, string[]> = {};
    for (const territory of Object.values(game.territories)) {
      const continentId = territory.continentId;
      if (!continentId) continue;

      if (!continentGroups[continentId]) {
        continentGroups[continentId] = [];
      }
      continentGroups[continentId].push(territory.id);
    }

    for (const [continentId, territoryIds] of Object.entries(continentGroups)) {
      const ownsAll = territoryIds.every(
        (id) => game.territories[id]?.ownerId === playerId,
      );

      if (ownsAll && CONTINENTS[continentId]) {
        troops += CONTINENTS[continentId].bonus;
      }
    }

    return troops;
  }

  /**
   * Places a specified amount of reinforcement troops onto a player's territory.
   * Decrements the player's remaining reinforcements.
   */
  static reinforce(
    game: GameState,
    playerId: string,
    territoryId: string,
    amount: number,
  ): ReinforceResult {
    const validation = ReinforcementValidator.validate(
      game,
      playerId,
      territoryId,
      amount,
    );

    if (!validation.valid) {
      return {
        success: false,
        error: validation.reason,
      };
    }

    const territory = game.territories[territoryId];

    const updatedGame: GameState = {
      ...game,
      reinforcementsLeft: game.reinforcementsLeft - amount,
      territories: {
        ...game.territories,
        [territoryId]: {
          ...territory,
          troops: territory.troops + amount,
        },
      },
    };

    return {
      success: true,
      game: updatedGame,
    };
  }
}

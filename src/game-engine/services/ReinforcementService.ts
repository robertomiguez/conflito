import type { GameState } from "../domain/GameState";

export class ReinforcementService {
  static calculate(game: GameState, playerId: string): number {
    const ownedTerritories = Object.values(game.territories).filter(
      (territory) => territory.ownerId === playerId,
    );

    return Math.max(3, Math.floor(ownedTerritories.length / 3));
  }
  static reinforce(
    game: GameState,
    territoryId: string,
    amount: number,
  ): GameState {
    const territory = game.territories[territoryId];

    return {
      ...game,

      territories: {
        ...game.territories,

        [territoryId]: {
          ...territory,

          troops: territory.troops + amount,
        },
      },
    };
  }
}

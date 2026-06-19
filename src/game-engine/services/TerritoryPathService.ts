import type { GameState } from "../domain/GameState";

export class TerritoryPathService {
  static areConnected(
    game: GameState,
    playerId: string,
    fromId: string,
    toId: string,
  ): boolean {
    const reachable = this.getReachableOwnedTerritories(game, playerId, fromId);
    return reachable.includes(toId);
  }

  static getReachableOwnedTerritories(
    game: GameState,
    playerId: string,
    fromId: string,
  ): string[] {
    const queue: string[] = [fromId];
    const visited = new Set<string>([fromId]);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const current = game.territories[currentId];
      if (!current) continue;

      for (const neighborId of current.neighbors) {
        if (visited.has(neighborId)) continue;

        const neighbor = game.territories[neighborId];
        if (neighbor && neighbor.ownerId === playerId) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    }

    visited.delete(fromId);
    return [...visited];
  }
}

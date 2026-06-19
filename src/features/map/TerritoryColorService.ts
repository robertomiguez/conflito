import type { Player } from "../../game-engine/domain/Player";

export class TerritoryColorService {
  static getColor(ownerId: string, players: Player[]): number {
    const player = players.find((p) => p.id === ownerId);
    if (!player?.color) {
      return 0x475569;
    }

    return this.hexToNumber(player.color);
  }

  private static hexToNumber(color: string): number {
    const normalized = color.startsWith("#") ? color.slice(1) : color;
    const parsed = Number.parseInt(normalized, 16);

    if (Number.isNaN(parsed)) {
      return 0x475569;
    }

    return parsed;
  }
}

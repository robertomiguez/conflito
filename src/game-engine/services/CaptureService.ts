import type { Territory } from "../domain/Territory";

export class CaptureService {
  static capture(from: Territory, to: Territory, playerId: string) {
    return {
      from: {
        ...from,
        troops: from.troops - 1,
      },

      to: {
        ...to,
        ownerId: playerId,
        troops: 1,
      },
    };
  }
}

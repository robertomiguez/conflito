import type { GameState } from "../domain/GameState";
import type { BattleResult } from "./BattleResult";

export interface AttackResult {
  game: GameState;
  battle: BattleResult;
  territoryCaptured: boolean;
}

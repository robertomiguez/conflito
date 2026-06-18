import type { Player } from "./Player";
import type { Territory } from "./Territory";
import { TurnPhase } from "../types";

export interface GameState {
  id: string;

  players: Player[];

  territories: Record<string, Territory>;

  currentPlayerId: string;

  turnNumber: number;

  phase: TurnPhase;
}

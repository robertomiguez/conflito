import type { Player } from "./Player"
import type { Territory } from "./Territory"

export interface GameState {
  id: string

  players: Player[]

  territories: Record<string, Territory>

  currentPlayerId: string

  turnNumber: number
}
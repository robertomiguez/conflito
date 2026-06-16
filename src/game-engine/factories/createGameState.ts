import type { GameState } from "../domain/GameState"
import type { Player } from "../domain/Player"
import type { MapDefinition } from "../types/MapDefinition"

export const createGameState = (
  map: MapDefinition,
  players: Player[]
): GameState => {

  const territories = Object.fromEntries(
    map.territories.map((territory, index) => {
      const owner = players[index % players.length]

      return [
        territory.id,
        {
          id: territory.id,
          ownerId: owner.id,
          troops: 1,
          neighbors: territory.neighbors
        }
      ]
    })
  )

  return {
    id: crypto.randomUUID(),

    players,

    territories,

    currentPlayerId: players[0].id,

    turnNumber: 1
  }
}
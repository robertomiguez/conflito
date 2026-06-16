<script setup lang="ts">
import map from "../game-engine/maps/demo-map.json"

import { demoPlayers } from "../game-engine/data/demoPlayers"

import { createGameState } from "../game-engine/factories/createGameState"

const game = createGameState(
  map,
  demoPlayers
)
</script>

<template>
  <div>
    <h1>World Conquest</h1>
    <pre>
        {{ JSON.stringify(game, null, 2) }}
    </pre>
  </div>
</template>
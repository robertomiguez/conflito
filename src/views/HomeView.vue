<script setup lang="ts">
import { ref, computed } from "vue";

import map from "../game-engine/maps/demo-map.json";

import { demoPlayers } from "../game-engine/data/demoPlayers";

import { createGameState } from "../game-engine/factories/createGameState";

import { TurnService } from "../game-engine/services";

import { ReinforcementService } from "../game-engine/services";

const game = ref(createGameState(map, demoPlayers));

const reinforcements = computed(() =>
  ReinforcementService.calculate(game.value, game.value.currentPlayerId),
);

function endTurn() {
  game.value = TurnService.endTurn(game.value);
}

function reinforceNorth() {
  game.value = ReinforcementService.reinforce(game.value, "north", 3);
}
</script>

<template>
  <div>
    <h1>World Conquest</h1>

    <p>Turn: {{ game.turnNumber }}</p>

    <p>
      Current Player:
      {{ game.currentPlayerId }}
    </p>

    <button @click="endTurn">End Turn</button>

    <pre>
        {{ JSON.stringify(game, null, 2) }}
    </pre>

    <p>
      Reinforcements:
      {{ reinforcements }}
    </p>
    <button @click="reinforceNorth">Add Troops To North</button>
  </div>
</template>

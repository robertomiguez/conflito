<script setup lang="ts">
import { ref, computed } from "vue";

import map from "../game-engine/maps/demo-map.json";

import { demoPlayers } from "../game-engine/data/demoPlayers";

import { createGameState } from "../game-engine/factories/createGameState";

import { TurnService } from "../game-engine/services";

import { ReinforcementService } from "../game-engine/services";

import { PhaseService } from "../game-engine/services";

import { AttackValidator } from "../game-engine/validators";

import { DiceService } from "../game-engine/services";

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

function nextPhase() {
  game.value = PhaseService.next(game.value);
}

function testAttack() {
  const result = AttackValidator.validate(
    game.value,
    "player-1",
    "north",
    "center",
  );

  console.log(result);
}

function testDice() {
  const result = DiceService.resolveBattle(3, 2);

  console.log(result);
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

  <p>
    Phase:
    {{ game.phase }}
  </p>

  <button @click="nextPhase">Next Phase</button>

  <button @click="testAttack">Test Attack</button>

  <button @click="testDice">Test Dice</button>
</template>

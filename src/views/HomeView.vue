<script setup lang="ts">
import { ref, computed } from "vue";

import map from "../game-engine/maps/demo-map.json";

import { demoPlayers } from "../game-engine/data/demoPlayers";

import { createGameState } from "../game-engine/factories/createGameState";

import { TurnService } from "../game-engine/services";

import { ReinforcementService } from "../game-engine/services";

import { PhaseService } from "../game-engine/services";

import { DiceService } from "../game-engine/services";
import { AttackService } from "../game-engine/services";
import { VictoryService } from "../game-engine/services/VictoryService";

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

function testDice() {
  const result = DiceService.resolveBattle(3, 2);

  console.log(result);
}

function testAttack() {
  try {
    const result = AttackService.execute(
      game.value,
      "player-1",
      "north",
      "center",
    );

    game.value = result.game;

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

const victory = computed(() => VictoryService.evaluate(game.value));
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

  <button @click="testDice">Test Dice</button>

  <p><button @click="testAttack">Attack North → Center</button></p>

  <p>
    Game Over:
    {{ victory.gameOver }}
  </p>

  <p>
    Winner:
    {{ victory.winnerId }}
  </p>
</template>

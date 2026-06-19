<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Application } from "pixi.js";

import { PixiMapRenderer } from "./PixiMapRenderer";
import type { GameState } from "../../game-engine/domain/GameState";
import { demoMap } from "../../game-engine/maps/demoMap";

const container = ref<HTMLDivElement | null>(null);
const props = defineProps<{
  game: GameState;
  selectedTerritoryId: string | null;
  onTerritoryClick: (territoryId: string) => void;
}>();

let renderer: PixiMapRenderer | null = null;

onMounted(async () => {
  const app = new Application();

  await app.init({
    width: 1250,
    height: 650,
    background: "#0f172a", // Slate 900 for a futuristic strategy look
  });

  container.value?.appendChild(app.canvas);

  renderer = new PixiMapRenderer(
    app,
    props.game,
    demoMap,
    props.selectedTerritoryId,
    props.onTerritoryClick,
  );

  renderer.draw();
});

// Reactively redraw the map when the game state or selection changes
watch(
  () => [props.game, props.selectedTerritoryId],
  () => {
    if (renderer) {
      renderer.game = props.game;
      renderer.selectedTerritoryId = props.selectedTerritoryId;
      renderer.draw();
    }
  },
  { deep: true },
);
</script>

<template>
  <div ref="container" class="pixi-canvas-container"></div>
</template>

<style scoped>
.pixi-canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0b0f19;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  border: 1px solid #1e293b;
}
</style>

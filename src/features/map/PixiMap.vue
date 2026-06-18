<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Application } from "pixi.js";

import { PixiMapRenderer } from "./PixiMapRenderer";

const container = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  const app = new Application();

  await app.init({
    width: 800,
    height: 300,
  });

  container.value?.appendChild(app.canvas);

  const renderer = new PixiMapRenderer(app);

  renderer.drawDemoMap();
});
</script>

<template>
  <div ref="container"></div>
</template>

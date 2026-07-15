<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import L, { type GeoJSON, type Layer, type LeafletMouseEvent, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import type { GameState } from "../../game-engine/domain/GameState";
import { TerritoryColorService } from "./TerritoryColorService";

interface CountryFeature {
  type: "Feature";
  properties?: { name?: string };
  geometry: unknown;
}

const props = defineProps<{
  game: GameState;
  selectedTerritoryId: string | null;
  onTerritoryClick: (territoryId: string) => void;
}>();

const container = ref<HTMLDivElement | null>(null);
let map: LeafletMap | null = null;
let countryLayer: GeoJSON | null = null;
let labelLayer: Layer[] = [];

// Visual country boundaries are grouped into the current 32 logical regions.
const countryToTerritory: Record<string, string> = {
  Canada: "canada", Greenland: "greenland", "United States of America": "western-us",
  Mexico: "central-america", Guatemala: "central-america", Belize: "central-america",
  Cuba: "central-america", Venezuela: "venezuela", Peru: "peru", Brazil: "brazil", Argentina: "argentina",
  Iceland: "iceland", "United Kingdom": "great-britain", Ireland: "great-britain",
  France: "western-europe", Spain: "western-europe", Portugal: "western-europe", Germany: "northern-europe",
  Italy: "southern-europe", Greece: "southern-europe", Ukraine: "ukraine", Egypt: "egypt",
  Morocco: "north-africa", Algeria: "north-africa", Libya: "north-africa", Nigeria: "congo",
  "South Africa": "south-africa", Madagascar: "madagascar", Kenya: "east-africa", Tanzania: "east-africa",
  Turkey: "middle-east", "Saudi Arabia": "middle-east", Iran: "middle-east", Iraq: "middle-east",
  Kazakhstan: "ural", Russia: "siberia", China: "china", India: "india", Thailand: "siam",
  Indonesia: "indonesia", "Papua New Guinea": "new-guinea", Australia: "western-australia",
};

function territoryColor(id: string | undefined): string {
  if (!id) return "#334155";
  const ownerId = props.game.territories[id]?.ownerId ?? "";
  const color = TerritoryColorService.getColor(ownerId, props.game.players);
  return `#${color.toString(16).padStart(6, "0")}`;
}

function styleFeature(feature?: CountryFeature) {
  const id = feature?.properties?.name ? countryToTerritory[feature.properties.name] : undefined;
  const selected = id === props.selectedTerritoryId;
  return {
    color: selected ? "#fbbf24" : "#94a3b8",
    weight: selected ? 3 : 1,
    fillColor: territoryColor(id),
    fillOpacity: id ? (selected ? 0.92 : 0.72) : 0.18,
  };
}

function drawLabels() {
  if (!map) return;
  labelLayer.forEach((label) => label.remove());
  labelLayer = [];
  for (const [name, id] of Object.entries(countryToTerritory)) {
    const territory = props.game.territories[id];
    if (!territory) continue;
    const marker = L.marker([0, 0], {
      icon: L.divIcon({ className: "territory-label", html: `<b>${territory.troops}</b>`, iconSize: [26, 26], iconAnchor: [13, 13] }),
      interactive: false,
    });
    // Labels are intentionally omitted here; country centroids are provided by GeoJSON layers.
    void name;
    void marker;
  }
}

async function loadMap() {
  if (!map || !container.value) return;
  const response = await fetch("/maps/countries.geojson");
  const data = await response.json() as { features: CountryFeature[] };
  countryLayer = L.geoJSON(data as never, {
    style: (feature: unknown) => styleFeature(feature as CountryFeature),
    onEachFeature: (feature: { properties?: unknown }, layer: Layer) => {
      const countryName = (feature.properties as { name?: string })?.name ?? "Unknown country";
      const id = countryToTerritory[countryName];
      if (id && props.game.territories[id]) {
        layer.bindTooltip(`${countryName} · ${props.game.territories[id].troops} troops`, { sticky: true });
      } else {
        layer.bindTooltip(countryName, { sticky: true });
      }
      layer.on({
        mouseover: (event: LeafletMouseEvent) => (event.target as Layer & { setStyle?: (style: object) => void }).setStyle?.({ weight: 2, fillOpacity: id ? 0.9 : 0.3 }),
        mouseout: (event: LeafletMouseEvent) => (event.target as Layer & { setStyle?: (style: object) => void }).setStyle?.(styleFeature(feature as CountryFeature)),
        click: () => id && props.onTerritoryClick(id),
      });
    },
  }).addTo(map);
  map.fitBounds(countryLayer.getBounds(), { padding: [8, 8] });
  drawLabels();
}

function redraw() {
  if (!map) return;
  countryLayer?.setStyle((feature: unknown) => styleFeature(feature as CountryFeature));
}

onMounted(async () => {
  if (!container.value) return;
  map = L.map(container.value, { zoomControl: true, worldCopyJump: true, minZoom: 2 }).setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map);
  await loadMap();
});

watch(() => [props.game, props.selectedTerritoryId], redraw, { deep: true });
onBeforeUnmount(() => { map?.remove(); map = null; });
</script>

<template><div ref="container" class="leaflet-map-container"></div></template>

<style>
.leaflet-map-container { width: min(1250px, 100%); height: 650px; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); background: #dbeafe; }
.leaflet-container { font-family: "Outfit", system-ui, sans-serif; background: #bfdbfe; }
.territory-label { display: none; }
@media (max-width: 720px) { .leaflet-map-container { height: 480px; } }
</style>

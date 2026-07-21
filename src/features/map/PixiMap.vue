<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import L, { type GeoJSON, type LatLngBounds, type Layer, type LeafletMouseEvent, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import type { GameState } from "../../game-engine/domain/GameState";
import { COUNTRY_NAME_TO_ID } from "../../constants/countryTerritories";
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
  onTerritoryDrop?: (territoryId: string, amount: number) => void;
}>();

const container = ref<HTMLDivElement | null>(null);
let map: LeafletMap | null = null;
let countryLayer: GeoJSON | null = null;
let labelLayer: Layer[] = [];
let territoryBounds: Partial<Record<string, LatLngBounds>> = {};

const territoryLabelPositions: Partial<Record<string, [number, number]>> = {
  "country-ago": [-12, 18],
  "country-arg": [-38, -64],
  "country-aus": [-25, 134],
  "country-bol": [-17, -65],
  "country-bra": [-10, -55],
  "country-can": [56, -106],
  "country-chl": [-35, -71],
  "country-chn": [35, 103],
  "country-cod": [-3, 23],
  "country-col": [4, -72],
  "country-deu": [51, 10],
  "country-dza": [28, 2],
  "country-egy": [27, 30],
  "country-esp": [40, -4],
  "country-fin": [64, 26],
  "country-fra": [46, 2],
  "country-gbr": [54, -2],
  "country-grl": [72, -40],
  "country-gtm": [15, -90],
  "country-idn": [-2, 118],
  "country-ind": [22, 79],
  "country-irn": [32, 53],
  "country-isl": [65, -19],
  "country-ita": [42, 12],
  "country-jpn": [36, 138],
  "country-kaz": [48, 68],
  "country-lby": [27, 17],
  "country-mex": [23, -102],
  "country-mdg": [-19, 47],
  "country-mli": [17, -4],
  "country-mng": [46, 104],
  "country-ner": [17, 9],
  "country-nic": [13, -85],
  "country-nor": [64, 11],
  "country-nzl": [-41, 174],
  "country-per": [-10, -75],
  "country-png": [-6, 147],
  "country-pol": [52, 19],
  "country-usa": [39, -98],
  "country-rus": [61, 100],
  "country-sau": [24, 45],
  "country-sdn": [15, 30],
  "country-slb": [-9, 160],
  "country-kor": [36, 128],
  "country-nga": [9, 8],
  "country-swe": [62, 15],
  "country-tcd": [15, 19],
  "country-tur": [39, 35],
  "country-ukr": [49, 32],
  "country-ven": [7, -66],
  "country-zaf": [-30, 25],
};

function territoryColor(id: string | undefined): string {
  if (!id) return "#334155";
  const ownerId = props.game.territories[id]?.ownerId ?? "";
  const color = TerritoryColorService.getColor(ownerId, props.game.players);
  return `#${color.toString(16).padStart(6, "0")}`;
}

function styleFeature(feature?: CountryFeature) {
  const id = feature?.properties?.name ? COUNTRY_NAME_TO_ID[feature.properties.name] : undefined;
  const selected = id === props.selectedTerritoryId;
  return {
    color: selected ? "#fbbf24" : "#94a3b8",
    weight: selected ? 3 : 1,
    fillColor: territoryColor(id),
    fillOpacity: id ? (selected ? 0.92 : 0.72) : 0.18,
  };
}

function tooltipContent(countryName: string, territoryId: string | undefined): string {
  const territory = territoryId ? props.game.territories[territoryId] : null;
  return territory ? `${countryName} · ${territory.troops} troops` : countryName;
}

function drawLabels() {
  if (!map) return;
  labelLayer.forEach((label) => label.remove());
  labelLayer = [];
  for (const [id, territory] of Object.entries(props.game.territories)) {
    const position = territoryLabelPositions[id] ?? territoryBounds[id]?.getCenter();
    if (!territory || !position) continue;
    const marker = L.marker(position, {
      icon: L.divIcon({
        className: `territory-label${id === props.selectedTerritoryId ? " selected" : ""}`,
        html: `<b>${territory.troops}</b>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
      interactive: true,
    }).addTo(map);
    marker.on("click", () => props.onTerritoryClick(id));
    marker.on("add", () => {
      const element = marker.getElement();
      if (!element) return;
      element.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
      element.addEventListener("drop", (event) => {
        event.preventDefault();
        const amount = Number(event.dataTransfer?.getData("application/x-conflito-reinforcement") ?? "1");
        props.onTerritoryDrop?.(id, Number.isFinite(amount) && amount > 0 ? amount : 1);
      });
    });
    labelLayer.push(marker);
  }
}

function refreshTooltips() {
  countryLayer?.eachLayer((layer) => {
    const feature = (layer as Layer & { feature?: CountryFeature }).feature;
    const countryName = feature?.properties?.name ?? "Unknown country";
    const id = COUNTRY_NAME_TO_ID[countryName];
    layer.bindTooltip(tooltipContent(countryName, id), { sticky: true });
  });
}

async function loadMap() {
  if (!map || !container.value) return;
  const response = await fetch("/maps/countries.geojson");
  const data = await response.json() as { features: CountryFeature[] };
  territoryBounds = {};
  countryLayer = L.geoJSON(data as never, {
    style: (feature: unknown) => styleFeature(feature as CountryFeature),
    onEachFeature: (feature: { properties?: unknown }, layer: Layer) => {
      const countryName = (feature.properties as { name?: string })?.name ?? "Unknown country";
      const id = COUNTRY_NAME_TO_ID[countryName];
      const boundedLayer = layer as Layer & { getBounds?: () => LatLngBounds };
      const bounds = boundedLayer.getBounds?.();
      if (id && bounds) {
        territoryBounds[id] = territoryBounds[id]
          ? territoryBounds[id]!.extend(bounds)
          : bounds;
      }
      layer.bindTooltip(tooltipContent(countryName, id), { sticky: true });
      layer.on({
        mouseover: (event: LeafletMouseEvent) => (event.target as Layer & { setStyle?: (style: object) => void }).setStyle?.({ weight: 2, fillOpacity: id ? 0.9 : 0.3 }),
        mouseout: (event: LeafletMouseEvent) => (event.target as Layer & { setStyle?: (style: object) => void }).setStyle?.(styleFeature(feature as CountryFeature)),
        click: () => id && props.onTerritoryClick(id),
      });
      layer.on("add", () => {
        const element = (layer as Layer & { getElement?: () => SVGElement | null }).getElement?.();
        if (!element || !id) return;
        element.addEventListener("dragover", (event) => {
          event.preventDefault();
        });
        element.addEventListener("drop", (event) => {
          event.preventDefault();
          const amount = Number(event.dataTransfer?.getData("application/x-conflito-reinforcement") ?? "1");
          props.onTerritoryDrop?.(id, Number.isFinite(amount) && amount > 0 ? amount : 1);
        });
      });
    },
  }).addTo(map);
  map.fitBounds(countryLayer.getBounds(), { padding: [8, 8] });
  drawLabels();
}

function redraw() {
  if (!map) return;
  countryLayer?.setStyle((feature: unknown) => styleFeature(feature as CountryFeature));
  refreshTooltips();
  drawLabels();
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
.territory-label {
  align-items: center;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(226, 232, 240, 0.7);
  border-radius: 999px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.28);
  color: #ffffff;
  display: flex;
  font-size: 13px;
  justify-content: center;
  line-height: 1;
}
.territory-label.selected {
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.28), 0 6px 16px rgba(15, 23, 42, 0.28);
}
@media (max-width: 720px) { .leaflet-map-container { height: 480px; } }
</style>

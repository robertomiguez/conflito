<script setup lang="ts">
import { ref, computed } from "vue";

import { WORLD_MAP_DEFINITION } from "../constants/mapDefinition";
import { demoPlayers } from "../game-engine/data/demoPlayers";
import { createGameState } from "../game-engine/factories/createGameState";
import { ReinforcementService } from "../game-engine/services/ReinforcementService";
import { AttackService } from "../game-engine/services/AttackService";
import { FortificationService } from "../game-engine/services/FortificationService";
import { PhaseService } from "../game-engine/services/PhaseService";
import { VictoryService } from "../game-engine/services/VictoryService";
import { TerritoryPathService } from "../game-engine/services/TerritoryPathService";
import type { BattleResult } from "../game-engine/types/BattleResult";

import PixiMap from "../features/map/PixiMap.vue";

// ─── Game State ────────────────────────────────────────────────────
const game = ref(createGameState(WORLD_MAP_DEFINITION, demoPlayers));

// ─── UI State ──────────────────────────────────────────────────────
const selectedTerritoryId = ref<string | null>(null);
const selectedReinforcementPieces = ref<number[]>([]);
const fortifyAmount = ref(1);
const attackerDice = ref(1);
const troopsToMoveOnCapture = ref(1);
const lastBattle = ref<BattleResult | null>(null);
const lastTerritoryCaptured = ref(false);
const actionMessage = ref<string | null>(null);

// ─── Computed ──────────────────────────────────────────────────────
const victory = computed(() => VictoryService.evaluate(game.value));
const isGameOver = computed(() => victory.value.gameOver || game.value.winnerId != null);

const selectedTerritory = computed(() =>
  selectedTerritoryId.value
    ? game.value.territories[selectedTerritoryId.value]
    : null,
);

const selectedTerritoryName = computed(() => {
  if (!selectedTerritoryId.value) return null;
  return (
    WORLD_MAP_DEFINITION.territories.find(
      (t) => t.id === selectedTerritoryId.value,
    )?.name ?? selectedTerritoryId.value
  );
});

const reinforcementsLeft = computed(() => game.value.reinforcementsLeft);
const reinforcementPieces = computed(() =>
  Array.from({ length: reinforcementsLeft.value }, (_, index) => index + 1),
);
const selectedReinforcementAmount = computed(() => selectedReinforcementPieces.value.length);

// For attack phase: is the selected territory an owned attacker?
const isAttackSource = computed(() => {
  if (game.value.phase !== "attack") return false;
  return selectedTerritory.value?.ownerId === game.value.currentPlayerId;
});

// Neighbour territories of the selected one
const neighborTerritories = computed(() => {
  if (!selectedTerritory.value) return [];
  return selectedTerritory.value.neighbors.map((id) => {
    const state = game.value.territories[id];
    const name = WORLD_MAP_DEFINITION.territories.find((t) => t.id === id)?.name ?? id;
    return { id, name, state };
  });
});

const attackableNeighbors = computed(() =>
  neighborTerritories.value.filter(
    (n) =>
      n.state &&
      n.state.ownerId !== game.value.currentPlayerId &&
      n.state.troops >= 1,
  ),
);

const fortifiableNeighbors = computed(() => {
  if (!selectedTerritoryId.value || !selectedTerritory.value) return [];

  const reachableIds = TerritoryPathService.getReachableOwnedTerritories(
    game.value,
    game.value.currentPlayerId,
    selectedTerritoryId.value,
  );

  return reachableIds.map((id) => {
    const state = game.value.territories[id];
    const name =
      WORLD_MAP_DEFINITION.territories.find((t) => t.id === id)?.name ?? id;
    return { id, name, state };
  });
});

const maxAttackerDice = computed(() => {
  if (!selectedTerritory.value) return 0;
  return Math.min(3, selectedTerritory.value.troops - 1);
});

const maxTroopsToMoveOnCapture = computed(() => {
  if (!selectedTerritory.value) return 1;
  return selectedTerritory.value.troops - 1;
});

// Keep attack controls in valid ranges when selection changes
function syncAttackControls() {
  const maxDice = maxAttackerDice.value;
  if (maxDice <= 0) {
    attackerDice.value = 1;
    troopsToMoveOnCapture.value = 1;
    return;
  }

  if (attackerDice.value > maxDice) {
    attackerDice.value = maxDice;
  } else if (attackerDice.value < 1) {
    attackerDice.value = 1;
  }

  const maxMove = maxTroopsToMoveOnCapture.value;
  if (troopsToMoveOnCapture.value < attackerDice.value) {
    troopsToMoveOnCapture.value = attackerDice.value;
  } else if (troopsToMoveOnCapture.value > maxMove) {
    troopsToMoveOnCapture.value = maxMove;
  }
}

const phaseLabel = computed(() => {
  switch (game.value.phase) {
    case "reinforcement": return "Reinforcement";
    case "attack":        return "Attack";
    case "fortify":       return "Fortify";
    default:              return game.value.phase;
  }
});

const phaseBadgeClass = computed(() => {
  switch (game.value.phase) {
    case "reinforcement": return "badge-blue";
    case "attack":        return "badge-red";
    case "fortify":       return "badge-green";
    default:              return "badge-purple";
  }
});

// ─── Actions ───────────────────────────────────────────────────────
function handleTerritoryClick(territoryId: string) {
  if (isGameOver.value) return;

  const territory = game.value.territories[territoryId];
  if (!territory) return;

  // In attack phase: first click → pick attacker, second click on enemy neighbor → attack
  if (game.value.phase === "attack" && isAttackSource.value && selectedTerritoryId.value !== territoryId) {
    const from = selectedTerritory.value;
    if (from && from.ownerId === game.value.currentPlayerId && territory.ownerId !== game.value.currentPlayerId) {
      if (from.neighbors.includes(territoryId)) {
        doAttack(selectedTerritoryId.value!, territoryId);
        return;
      }
    }
  }

  selectedTerritoryId.value = territoryId;
  syncAttackControls();
  actionMessage.value = null;
}

function doAttack(fromId: string, toId: string) {
  if (isGameOver.value) return;

  const result = AttackService.execute(
    game.value,
    game.value.currentPlayerId,
    fromId,
    toId,
    attackerDice.value,
    troopsToMoveOnCapture.value,
  );

  if (!result.success || !result.game) {
    actionMessage.value = `⚠ ${result.error}`;
    return;
  }

  game.value = result.game;
  lastBattle.value = result.battle ?? null;
  lastTerritoryCaptured.value = result.territoryCaptured ?? false;
  actionMessage.value = result.territoryCaptured
    ? `🏳 Territory captured!`
    : `⚔ Battle resolved.`;

  selectedTerritoryId.value = null;
}

function doReinforce(territoryId: string, amount = 1) {
  if (isGameOver.value) return;

  const result = ReinforcementService.reinforce(
    game.value,
    game.value.currentPlayerId,
    territoryId,
    amount,
  );

  if (!result.success || !result.game) {
    actionMessage.value = `⚠ ${result.error}`;
    return;
  }

  const reinforcedGame = result.game;
  if (reinforcedGame.reinforcementsLeft === 0) {
    const phaseResult = PhaseService.next(
      reinforcedGame,
      reinforcedGame.currentPlayerId,
    );

    if (!phaseResult.success || !phaseResult.game) {
      actionMessage.value = `⚠ ${phaseResult.error?.replace(/_/g, " ")}`;
      game.value = reinforcedGame;
      return;
    }

    game.value = phaseResult.game;
    actionMessage.value = `✓ Placed ${amount} troop${amount !== 1 ? "s" : ""}. Attack phase started.`;
  } else {
    game.value = reinforcedGame;
    actionMessage.value = `✓ Placed ${amount} troop${amount !== 1 ? "s" : ""}.`;
  }

  selectedReinforcementPieces.value = [];
}

function toggleReinforcementPiece(pieceIndex: number) {
  if (isGameOver.value || reinforcementsLeft.value === 0) return;
  const current = selectedReinforcementPieces.value;
  if (current.includes(pieceIndex)) {
    selectedReinforcementPieces.value = current.filter((piece) => piece !== pieceIndex);
    return;
  }
  selectedReinforcementPieces.value = [...current, pieceIndex].sort((a, b) => a - b);
}

function handleReinforcementDragStart(event: DragEvent, amount: number) {
  event.dataTransfer?.setData("application/x-conflito-reinforcement", String(amount));
  event.dataTransfer?.setData("text/plain", String(amount));
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
  }
}

function getReinforcementDragAmount(pieceIndex: number) {
  return selectedReinforcementPieces.value.includes(pieceIndex)
    ? Math.max(1, selectedReinforcementAmount.value)
    : 1;
}

function handleReinforcementDrop(territoryId: string, amount: number) {
  doReinforce(territoryId, amount);
}

function doFortify(toId: string) {
  if (isGameOver.value || !selectedTerritoryId.value) return;
  const result = FortificationService.execute(
    game.value,
    game.value.currentPlayerId,
    selectedTerritoryId.value,
    toId,
    fortifyAmount.value,
  );

  if (!result.success || !result.game) {
    actionMessage.value = `⚠ ${result.error}`;
    return;
  }

  game.value = result.game;
  fortifyAmount.value = 1;
  selectedTerritoryId.value = null;
  actionMessage.value = "✓ Troops moved.";
}

function nextPhase() {
  if (isGameOver.value) return;

  const result = PhaseService.next(game.value, game.value.currentPlayerId);
  if (!result.success || !result.game) {
    actionMessage.value = `⚠ ${result.error?.replace(/_/g, " ")}`;
    return;
  }
  game.value = result.game;
  selectedTerritoryId.value = null;
  lastBattle.value = null;
  actionMessage.value = null;
}

function newGame() {
  game.value = createGameState(WORLD_MAP_DEFINITION, demoPlayers);
  selectedTerritoryId.value = null;
  selectedReinforcementPieces.value = [];
  lastBattle.value = null;
  lastTerritoryCaptured.value = false;
  actionMessage.value = null;
  fortifyAmount.value = 1;
  attackerDice.value = 1;
  troopsToMoveOnCapture.value = 1;
}

function getPlayerColor(playerId: string | null): string {
  const p = game.value.players.find((pl) => pl.id === playerId);
  return p?.color ?? "#475569";
}

function getPlayerName(playerId: string | null): string {
  if (!playerId) return "—";
  const p = game.value.players.find((pl) => pl.id === playerId);
  return p?.name ?? playerId;
}
</script>

<template>
  <div class="game-shell">
    <!-- ─── Header ────────────────────────────────────────────── -->
    <header class="game-header">
      <div class="header-left">
        <div class="game-logo">
          <span class="logo-icon">⚔</span>
          <span class="logo-text">CONFLITO</span>
        </div>
        <span class="logo-sub">World Conquest</span>
      </div>
      <div class="header-center">
        <div class="turn-badge">
          <span class="text-muted">Turn</span>
          <span class="turn-num font-mono">{{ game.turnNumber }}</span>
        </div>
      </div>
      <div class="header-right">
        <button id="btn-new-game" class="btn btn-ghost" @click="newGame">↺ New Game</button>
      </div>
    </header>

    <!-- ─── Main Layout ──────────────────────────────────────── -->
    <main class="game-main">
      <!-- Map Panel -->
      <section class="map-panel">
        <div class="map-picker" aria-label="Map type">
          <div class="map-picker-copy">
            <span class="map-picker-kicker">Battlefield</span>
            <strong>World Countries</strong>
            <span>One territory per country</span>
          </div>
        </div>
        <PixiMap
          :game="game"
          :selected-territory-id="selectedTerritoryId"
          :on-territory-click="handleTerritoryClick"
          :on-territory-drop="handleReinforcementDrop"
        />
        <p v-if="actionMessage" class="action-toast" :class="{ captured: lastTerritoryCaptured }">
          {{ actionMessage }}
        </p>
      </section>

      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Player Info -->
        <div class="card player-card">
          <div class="player-indicator" :style="{ '--player-color': getPlayerColor(game.currentPlayerId) }">
            <div class="player-dot"></div>
            <div>
              <div class="player-name">{{ getPlayerName(game.currentPlayerId) }}</div>
              <div class="text-muted" style="font-size:11px;">Active Player</div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="phase-row">
            <span class="text-muted" style="font-size:12px;">Phase</span>
            <span class="badge" :class="phaseBadgeClass">{{ phaseLabel }}</span>
          </div>
          <div v-if="game.phase === 'reinforcement'" class="reinforce-left">
            <span class="rl-num font-mono">{{ reinforcementsLeft }}</span>
            <span class="text-muted" style="font-size:12px;">troops to place</span>
          </div>
        </div>

        <!-- Player Scores -->
        <div class="card scores-card">
          <div class="scores-title">Territory Control</div>
          <div v-for="player in game.players" :key="player.id" class="score-row">
            <div class="score-dot" :style="{ backgroundColor: player.color }"></div>
            <span class="score-name">{{ player.name }}</span>
            <span class="score-count font-mono">
              {{ Object.values(game.territories).filter(t => t.ownerId === player.id).length }}
              <span class="text-muted" style="font-size:10px;">/ {{ Object.keys(game.territories).length }}</span>
            </span>
          </div>
        </div>

        <!-- Reinforcement Pieces -->
        <div v-if="game.phase === 'reinforcement'" class="card reinforcement-card">
          <div class="panel-label">Place Reinforcements</div>
          <p class="hint-text reinforce-hint">
            Select one or more troop pieces, then drag the stack onto any country you own.
          </p>
          <div class="reinforcement-tray" :class="{ empty: reinforcementsLeft === 0 }">
            <button
              v-for="piece in reinforcementPieces"
              :key="piece"
              class="reinforcement-piece"
              :class="{ selected: selectedReinforcementPieces.includes(piece) }"
              :disabled="reinforcementsLeft === 0"
              draggable="true"
              @click="toggleReinforcementPiece(piece)"
              @dragstart="handleReinforcementDragStart($event, getReinforcementDragAmount(piece))"
              :title="selectedReinforcementPieces.includes(piece) ? `Drag ${selectedReinforcementAmount} selected troop${selectedReinforcementAmount !== 1 ? 's' : ''}` : `Drag 1 troop or click to select`"
            >
              <span class="piece-ring"></span>
              <span class="piece-value">1</span>
            </button>
          </div>
          <div class="reinforcement-summary text-muted">
            <template v-if="selectedReinforcementAmount > 0">
              Selected: <strong>{{ selectedReinforcementAmount }}</strong> troop{{ selectedReinforcementAmount !== 1 ? "s" : "" }}
            </template>
            <template v-else>
              No stack selected. Drag any single piece to place 1 troop.
            </template>
          </div>
        </div>

        <!-- Context Panel -->
        <div class="card context-card">
          <!-- No selection -->
          <template v-if="!selectedTerritoryId">
            <p class="hint-text">
              <span v-if="game.phase === 'reinforcement'">🔵 Drag troop pieces onto countries you own.</span>
              <span v-else-if="game.phase === 'attack'">🔴 Click an owned territory to attack from.</span>
              <span v-else>🟢 Click an owned territory to move troops from.</span>
            </p>
          </template>

          <!-- Territory selected -->
          <template v-else>
            <div class="ctx-header">
              <span class="ctx-territory-name">{{ selectedTerritoryName }}</span>
              <span class="badge" :style="{ backgroundColor: getPlayerColor(selectedTerritory?.ownerId ?? null) + '22', color: getPlayerColor(selectedTerritory?.ownerId ?? null), borderColor: getPlayerColor(selectedTerritory?.ownerId ?? null) + '44' }">
                {{ selectedTerritory?.troops }} troops
              </span>
            </div>
            <div class="ctx-owner text-muted">
              Owned by <strong style="color: var(--text-primary);">{{ getPlayerName(selectedTerritory?.ownerId ?? null) }}</strong>
            </div>
            <div class="divider"></div>

            <template v-if="game.phase === 'reinforcement'">
              <p class="hint-text">
                Drop selected reinforcement pieces onto this country or any other country you own.
              </p>
            </template>

            <!-- ATTACK PANEL -->
            <template v-else-if="game.phase === 'attack' && isAttackSource">
              <div class="panel-label">Attack from here</div>
              <div class="attack-controls">
                <label class="control-label" for="attack-dice-slider">Dice</label>
                <div class="num-input">
                  <input
                    id="attack-dice-slider"
                    type="range"
                    min="1"
                    :max="maxAttackerDice"
                    v-model.number="attackerDice"
                    @input="syncAttackControls()"
                  />
                  <span class="val">{{ attackerDice }}</span>
                </div>
                <label class="control-label" for="capture-move-slider">Troops to move if captured</label>
                <div class="num-input">
                  <input
                    id="capture-move-slider"
                    type="range"
                    :min="attackerDice"
                    :max="maxTroopsToMoveOnCapture"
                    v-model.number="troopsToMoveOnCapture"
                  />
                  <span class="val">{{ troopsToMoveOnCapture }}</span>
                </div>
              </div>
              <div v-if="attackableNeighbors.length === 0" class="hint-text">No enemies adjacent.</div>
              <div v-else class="neighbor-list">
                <button
                  v-for="neighbor in attackableNeighbors"
                  :key="neighbor.id"
                  class="btn btn-danger neighbor-btn"
                  @click="doAttack(selectedTerritoryId!, neighbor.id)"
                >
                  <span class="nb-name">⚔ {{ neighbor.name }}</span>
                  <span class="nb-troops font-mono">{{ neighbor.state?.troops }}</span>
                </button>
              </div>
            </template>

            <!-- FORTIFY PANEL -->
            <template v-else-if="game.phase === 'fortify' && selectedTerritory?.ownerId === game.currentPlayerId && !game.hasFortified">
              <div class="panel-label">Move Troops</div>
              <div class="num-input" style="margin: 10px 0;">
                <input
                  id="fortify-slider"
                  type="range"
                  min="1"
                  :max="(selectedTerritory?.troops ?? 2) - 1"
                  v-model.number="fortifyAmount"
                />
                <span class="val">{{ fortifyAmount }}</span>
              </div>
              <div v-if="fortifiableNeighbors.length === 0" class="hint-text">No connected owned territories.</div>
              <div v-else class="neighbor-list">
                <button
                  v-for="neighbor in fortifiableNeighbors"
                  :key="neighbor.id"
                  class="btn btn-success neighbor-btn"
                  @click="doFortify(neighbor.id)"
                >
                  <span class="nb-name">→ {{ neighbor.name }}</span>
                  <span class="nb-troops font-mono">{{ neighbor.state?.troops }}</span>
                </button>
              </div>
            </template>

            <template v-else-if="game.hasFortified && game.phase === 'fortify'">
              <p class="hint-text badge badge-green" style="display:block;text-align:center;">Already fortified this turn.</p>
            </template>

            <template v-else>
              <p class="hint-text">This territory is not yours.</p>
            </template>
          </template>
        </div>

        <!-- Battle Result -->
        <div v-if="lastBattle" class="card battle-card">
          <div class="battle-title">
            {{ lastTerritoryCaptured ? '🏴 Territory Captured!' : '⚔ Battle Result' }}
          </div>
          <div class="battle-sides">
            <div class="battle-side">
              <span class="side-label" style="color: var(--player-1);">Attacker</span>
              <div class="dice-row">
                <div
                  v-for="(roll, i) in lastBattle.attackerRolls"
                  :key="i"
                  class="die die-attacker"
                >{{ roll }}</div>
              </div>
              <span class="losses">-{{ lastBattle.attackerLosses }}</span>
            </div>
            <span class="battle-vs">VS</span>
            <div class="battle-side">
              <span class="side-label" style="color: var(--player-2);">Defender</span>
              <div class="dice-row">
                <div
                  v-for="(roll, i) in lastBattle.defenderRolls"
                  :key="i"
                  class="die die-defender"
                >{{ roll }}</div>
              </div>
              <span class="losses">-{{ lastBattle.defenderLosses }}</span>
            </div>
          </div>
        </div>

        <!-- Phase Controls -->
        <div v-if="game.phase !== 'reinforcement'" class="card phase-controls">
          <div class="phase-hint text-muted">
            <template v-if="game.phase === 'attack'">
              Attack as much as you want, then proceed.
            </template>
            <template v-else>
              Optionally fortify one territory, then end turn.
            </template>
          </div>
          <button
            id="btn-next-phase"
            class="btn btn-amber"
            style="width:100%; margin-top:10px;"
            :disabled="isGameOver"
            @click="nextPhase"
          >
            {{ game.phase === 'fortify' ? '↩ End Turn' : '→ Next Phase' }}
          </button>
        </div>
      </aside>
    </main>

    <!-- ─── Victory Overlay ──────────────────────────────────── -->
    <Transition name="victory">
      <div v-if="victory.gameOver" class="victory-overlay">
        <div class="victory-card">
          <div class="victory-crown">👑</div>
          <h1 class="victory-title">Victory!</h1>
          <p class="victory-subtitle">
            <strong :style="{ color: getPlayerColor(victory.winnerId) }">
              {{ getPlayerName(victory.winnerId) }}
            </strong>
            has conquered the world.
          </p>
          <button id="btn-play-again" class="btn btn-primary" style="margin-top:24px; padding: 12px 32px; font-size:15px;" @click="newGame">
            ↺ Play Again
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ─── Shell ──────────────────────────────────────────────────────── */
.game-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
}

/* ─── Header ─────────────────────────────────────────────────────── */
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.game-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 22px;
  filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.5));
}

.logo-text {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.12em;
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-sub {
  color: var(--text-muted);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.header-center {
  display: flex;
  align-items: center;
}

.turn-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 9999px;
  font-size: 13px;
}

.turn-num {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-amber);
}

/* ─── Main Layout ────────────────────────────────────────────────── */
.game-main {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
}

/* ─── Map Panel ──────────────────────────────────────────────────── */
.map-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 12px;
  position: relative;
  overflow: auto;
}

.map-picker {
  width: min(1250px, 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: linear-gradient(100deg, rgba(17, 29, 51, 0.96), rgba(23, 38, 61, 0.72));
}

.map-picker-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.map-picker-copy strong {
  color: var(--text-primary);
  font-size: 15px;
}

.map-picker-copy > span:last-child {
  color: var(--text-secondary);
  font-size: 11px;
}

.map-picker-kicker {
  color: var(--accent-blue);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

@media (max-width: 720px) {
  .map-picker { align-items: flex-start; }
}

.action-toast {
  font-size: 13px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 9999px;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  animation: slide-up 0.3s var(--ease);
}

.action-toast.captured {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--accent-green);
}

/* ─── Sidebar ────────────────────────────────────────────────────── */
.sidebar {
  width: 300px;
  flex-shrink: 0;
  border-left: 1px solid var(--border);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  padding: 16px;
  gap: 12px;
}

/* ─── Player Card ────────────────────────────────────────────────── */
.player-card {
  animation: slide-up 0.3s var(--ease);
}

.player-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--player-color);
  box-shadow: 0 0 10px var(--player-color);
  flex-shrink: 0;
  animation: pulse-glow 2s ease-in-out infinite;
}

.player-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.phase-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reinforce-left {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.rl-num {
  font-size: 28px;
  font-weight: 800;
  color: var(--accent-blue);
  line-height: 1;
}

/* ─── Scores Card ────────────────────────────────────────────────── */
.scores-card {
  padding: 12px;
}

.scores-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
}

.score-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.score-name {
  flex: 1;
  font-size: 13px;
}

.score-count {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

/* ─── Context Card ───────────────────────────────────────────────── */
.context-card {
  flex: 1;
  min-height: 160px;
}

.hint-text {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.ctx-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.ctx-territory-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.ctx-owner {
  font-size: 12px;
  margin-top: 4px;
}

.attack-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 10px 0;
}

.control-label {
  font-size: 11px;
  color: var(--text-muted);
}

.panel-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.reinforce-hint {
  margin-top: 6px;
}

.reinforcement-tray {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
  padding: 10px;
  border: 1px dashed rgba(56, 189, 248, 0.28);
  border-radius: 16px;
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.12), transparent 60%),
    rgba(6, 11, 20, 0.3);
}

.reinforcement-tray.empty {
  opacity: 0.55;
}

.reinforcement-piece {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(226, 232, 240, 0.22);
  background:
    radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.22), transparent 35%),
    radial-gradient(circle at 50% 55%, rgba(56, 189, 248, 0.35), rgba(6, 11, 20, 0.92) 72%);
  color: #e2f3ff;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.16),
    0 8px 18px rgba(0, 0, 0, 0.38);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: grab;
  transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease), border-color 0.18s var(--ease);
}

.reinforcement-piece:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.03);
  border-color: rgba(56, 189, 248, 0.55);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    0 10px 22px rgba(0, 0, 0, 0.46);
}

.reinforcement-piece.selected {
  border-color: rgba(251, 191, 36, 0.65);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    0 0 0 3px rgba(251, 191, 36, 0.18),
    0 10px 22px rgba(0, 0, 0, 0.46);
  transform: translateY(-1px);
}

.reinforcement-piece:active:not(:disabled) {
  cursor: grabbing;
  transform: scale(0.98);
}

.reinforcement-piece:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.piece-ring {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.piece-value {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.reinforcement-summary {
  margin-top: 4px;
  font-size: 12px;
}

.neighbor-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.neighbor-btn {
  width: 100%;
  justify-content: space-between;
  font-size: 12px;
}

.nb-name { flex: 1; text-align: left; }
.nb-troops {
  font-size: 14px;
  font-weight: 700;
  opacity: 0.85;
}

/* ─── Battle Card ────────────────────────────────────────────────── */
.battle-card {
  animation: slide-up 0.3s var(--ease);
}

.battle-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.battle-sides {
  display: flex;
  align-items: center;
  gap: 10px;
}

.battle-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.side-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.battle-vs {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  flex-shrink: 0;
}

.losses {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-red);
}

/* ─── Phase Controls ─────────────────────────────────────────────── */
.phase-controls {}

.phase-hint {
  font-size: 11px;
  line-height: 1.5;
}

/* ─── Victory Overlay ────────────────────────────────────────────── */
.victory-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 11, 20, 0.88);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.victory-card {
  background: var(--bg-card);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 20px;
  padding: 48px 56px;
  text-align: center;
  box-shadow:
    0 0 60px rgba(56, 189, 248, 0.15),
    0 24px 64px rgba(0, 0, 0, 0.6);
  animation: slide-up 0.5s var(--ease);
}

.victory-crown {
  font-size: 56px;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 16px rgba(251, 191, 36, 0.6));
}

.victory-title {
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-amber), var(--accent-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.victory-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ─── Transition ─────────────────────────────────────────────────── */
.victory-enter-active { animation: fade-in 0.4s var(--ease); }
.victory-leave-active { animation: fade-in 0.3s var(--ease) reverse; }
</style>

# AGENTS.md

## Project Overview

Risk-style online strategy game built with:

- Frontend: Vue 3 + TypeScript
- Rendering: PixiJS
- Backend: Cloudflare Workers
- Multiplayer State: Durable Objects
- Database: D1
- Realtime: WebSockets via Durable Objects

Goal:
Create a modern Risk-inspired world conquest game supporting multiplayer, AI opponents, ranked matches, and tournaments.

---

# Agent Structure

## 1. Game Engine Agent

Responsible for all game rules.

### Owns

- Territory model
- Player model
- Continent bonuses
- Reinforcement calculations
- Attack validation
- Fortification validation
- Victory conditions
- Turn flow
- Dice battles

### Must Never

- Access UI components
- Access Pixi rendering code
- Access networking code

### Key Files

src/game-engine/
src/game-engine/models/
src/game-engine/services/

---

## 2. Pixi Rendering Agent

Responsible for visual representation only.

### Owns

- World map rendering
- Territory colors
- Selection highlights
- Animations
- Battle effects
- Camera controls
- Zoom and pan

### Must Never

- Execute game rules
- Calculate battles
- Modify player state

### Input

Receives immutable GameState.

### Key Files

src/rendering/
src/rendering/map/
src/rendering/layers/

---

## 3. Multiplayer Agent

Responsible for networking and synchronization.

### Owns

- Durable Objects
- Room management
- Match lifecycle
- Reconnection logic
- State broadcasting
- WebSocket events

### Must Never

- Execute game rules directly
- Render UI

### Key Files

workers/
workers/rooms/
workers/ws/

---

## 4. UI Agent

Responsible for Vue application.

### Owns

- Menus
- Lobby
- Matchmaking screens
- Player HUD
- Battle dialogs
- Settings

### Must Never

- Calculate game logic
- Access database directly

### Key Files

src/components/
src/views/
src/stores/

---

## 5. AI Opponent Agent

Responsible for computer players.

### Owns

- Attack decisions
- Reinforcement decisions
- Fortification decisions
- Difficulty levels

### Levels

- Easy
- Medium
- Hard

### Must Never

- Modify game rules

Uses public Game Engine APIs only.

### Key Files

src/ai/

---

## 6. Persistence Agent

Responsible for storage.

### Owns

- D1 schema
- Match history
- Rankings
- User profiles
- Statistics

### Must Never

- Execute game rules
- Handle rendering

### Key Files

workers/db/
workers/repositories/

---

## 7. Testing Agent

Responsible for validation.

### Owns

- Unit tests
- Integration tests
- Multiplayer tests
- Load tests

### Coverage Targets

- Game Engine: 95%
- Multiplayer: 90%
- UI: 80%

### Key Files

tests/
vitest/

---

# Shared Principles

## Single Source of Truth

GameState is authoritative.

No duplicated state.

---

## Deterministic Engine

Given the same:

- GameState
- Action
- Random seed

The result must always be identical.

---

## Map Balance

Whenever countries or territories are added, removed, split, or merged:

- Recalculate continent bonuses in `src/game-engine/constants/continents.ts`
- Verify starting territory distribution remains balanced for supported player counts
- Update relevant tests for reinforcement bonuses and initial ownership distribution
- Keep neighbor relationships symmetric unless a rule explicitly requires one-way movement

---

## Pure Game Rules

Game engine functions should be pure.

Example:

applyAttack(state, action) => newState

Never mutate existing state.

---

## Network Authority

Server is authoritative.

Clients cannot:

- Modify armies
- Change ownership
- End turns

Clients only send commands.

---

## Performance Rules

Target:

- 60 FPS rendering
- <100ms local actions
- <250ms multiplayer sync

---

# Development Phases

## Phase 1

Core Game

- World map
- Two players
- Territory ownership
- Reinforcements
- Battles
- Fortify
- Win condition

---

## Phase 2

Multiplayer

- Rooms
- Lobby
- Matchmaking
- Reconnection
- Chat

---

## Phase 3

Polish

- Animations
- Sound
- Statistics
- Replay system

---

## Phase 4

Advanced Features

- AI opponents
- Ranked ladder
- Tournaments
- Spectator mode

---

# Definition of Done

A task is complete only when:

- Code compiles
- Tests pass
- Types pass
- No console errors
- Documentation updated
- Multiplayer synchronization verified
- No game rule regressions

---

# Architecture Rule

Game Engine → Multiplayer → UI

Never:

UI → Game Engine → UI

Never:

Pixi → Game Logic

Never:

Database → Rendering

All communication flows through GameState and Commands.

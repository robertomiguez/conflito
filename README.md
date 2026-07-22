# Conflito

Conflito is a Risk-inspired world conquest game built with Vue 3, TypeScript, Leaflet, PixiJS, and a pure game-engine layer.

The current codebase focuses on a playable local prototype with:

- territory ownership and turn flow
- reinforcement placement
- attack resolution with dice
- fortification movement
- victory evaluation
- a world map rendered in the browser

The long-term project goal is to evolve this into a multiplayer strategy game with AI opponents, ranked play, and tournaments.

## Tech Stack

- Frontend: Vue 3 + TypeScript
- Rendering: Leaflet for the map UI, PixiJS for game visual effects and future rendering work
- Build tool: Vite
- Testing: Vitest

## Current Game Flow

The prototype follows the classic Risk loop:

1. Reinforcement
2. Attack
3. Fortify
4. Next turn

Game state is created from a map definition and a player list. The engine keeps the rules deterministic by using a seeded random service and pure state transitions.

## Project Structure

- `src/game-engine/`
  - Core rules, validators, services, types, and state factories
- `src/features/map/`
  - Browser map rendering and territory interaction
- `src/constants/`
  - Map definitions and country/territory mapping helpers
- `src/views/`
  - Vue screens
- `tests`
  - Unit and integration tests live alongside the implementation files and use Vitest

## Important Files

- [`src/game-engine/factories/createGameState.ts`](./src/game-engine/factories/createGameState.ts): creates the initial match state
- [`src/game-engine/services/AttackService.ts`](./src/game-engine/services/AttackService.ts): attack resolution
- [`src/game-engine/services/ReinforcementService.ts`](./src/game-engine/services/ReinforcementService.ts): troop placement
- [`src/game-engine/services/FortificationService.ts`](./src/game-engine/services/FortificationService.ts): troop movement between connected territories
- [`src/game-engine/services/PhaseService.ts`](./src/game-engine/services/PhaseService.ts): turn phase transitions
- [`src/game-engine/services/VictoryService.ts`](./src/game-engine/services/VictoryService.ts): win condition checks
- [`src/features/map/PixiMap.vue`](./src/features/map/PixiMap.vue): interactive world map view
- [`src/views/HomeView.vue`](./src/views/HomeView.vue): current game screen and controls

## Map and Rules

The game engine uses a continent-based territory model. Continent bonuses are defined in:

- [`src/game-engine/constants/continents.ts`](./src/game-engine/constants/continents.ts)

The current map and territory relationship data are stored in:

- [`src/constants/mapDefinition.ts`](./src/constants/mapDefinition.ts)
- [`src/constants/countryTerritories.ts`](./src/constants/countryTerritories.ts)

When changing territory layout, neighbor links, or continent membership, update the related engine constants and tests.

## Available Scripts

Run these from the project root:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run test
```

- `npm run dev`: start the Vite development server
- `npm run build`: type-check and build for production
- `npm run preview`: preview the production build locally
- `npm run test`: run the Vitest suite

## Development Notes

- Game rules should remain pure and live in `src/game-engine/`.
- UI code should only send commands and display state.
- Rendering code should consume immutable game state.
- Tests already cover the core rule services; add or update them whenever rules change.

## Status

This repository is actively evolving. The current implementation is a strong local prototype, not yet a full multiplayer product.

Planned future areas include:

- multiplayer rooms and synchronization
- AI opponents
- ranked matchmaking
- tournament support
- persistence and match history


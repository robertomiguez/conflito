# CONVENTIONS.md

# Coding Conventions

This document defines coding standards for the entire project.

All human developers and AI agents must follow these conventions.

---

# Core Principles

Priority order:

1. Correctness
2. Readability
3. Simplicity
4. Testability
5. Performance

Never sacrifice correctness for cleverness.

Prefer boring code over clever code.

---

# Technology Stack

Frontend

- Vue 3
- TypeScript
- Pinia
- PixiJS

Backend

- Cloudflare Workers
- Durable Objects
- D1

Testing

- Vitest

---

# TypeScript Rules

Always use TypeScript.

Never use plain JavaScript.

Bad:

```ts
const player = {};
```

Good:

```ts
const player: Player = {};
```

---

# Avoid Any

Never use:

```ts
any;
```

Use:

```ts
unknown;
```

or proper types.

Bad:

```ts
const result: any;
```

Good:

```ts
const result: BattleResult;
```

---

# Strict Mode

TypeScript strict mode must remain enabled.

Never disable:

```json
strict: true
```

---

# File Naming

Use PascalCase for:

- Components
- Classes
- Services

Examples:

```text
AttackService.ts
GameMap.vue
PlayerCard.vue
```

Use camelCase for utilities.

Examples:

```text
calculateBonus.ts
createSeed.ts
```

---

# Folder Naming

Use kebab-case.

Good:

```text
game-engine/
durable-objects/
battle-history/
```

Bad:

```text
GameEngine/
BattleHistory/
```

---

# Import Order

Order imports as follows:

```ts
// external

import { Container } from "pixi.js";

// internal types

import type { Territory } from "@/types";

// internal modules

import { AttackService } from "@/game-engine";
```

---

# Path Aliases

Use aliases.

Good:

```ts
import { GameState } from "@/types";
```

Bad:

```ts
import { GameState } from "../../../../types";
```

---

# Functions

Functions should do one thing.

Bad:

```ts
function processTurn() {
  attack();
  render();
  save();
  broadcast();
}
```

Good:

```ts
function resolveAttack() {}
```

---

# Function Length

Target:

20 lines or less.

Maximum:

50 lines.

If longer:

Extract methods.

---

# Nesting

Maximum nesting:

3 levels.

Bad:

```ts
if () {
  if () {
    if () {
      if () {

      }
    }
  }
}
```

Extract functions instead.

---

# Early Returns

Prefer early returns.

Bad:

```ts
if (valid) {
  doSomething();
}
```

Good:

```ts
if (!valid) {
  return;
}

doSomething();
```

---

# Classes vs Functions

Prefer functions.

Use classes only when:

- Stateful service
- Complex abstraction

Preferred:

```ts
export function canAttack() {}
```

Avoid unnecessary classes.

---

# Enums

Prefer union types.

Bad:

```ts
enum Phase {
  Attack,
}
```

Good:

```ts
type Phase = "reinforce" | "attack" | "fortify";
```

---

# Interfaces

Use interfaces for domain models.

Example:

```ts
interface Territory {
  id: string;
  ownerId: string;
  armies: number;
}
```

---

# Immutable State

Never mutate state.

Bad:

```ts
territory.armies += 1;
```

Good:

```ts
return {
  ...territory,
  armies: territory.armies + 1,
};
```

---

# Record Lookup Tables

Prefer O(1) lookup.

Good:

```ts
territories["BRAZIL"];
```

Bad:

```ts
territories.find(...)
```

Game state collections should use:

```ts
Record<string, Territory>;
```

---

# Vue Conventions

Use:

Composition API

Always:

```vue
<script setup lang="ts">
```

Never use:

Options API

Bad:

```vue
export default { data() {} }
```

---

# Vue Components

One responsibility per component.

Good:

```text
PlayerCard.vue
BattleDialog.vue
```

Bad:

```text
EverythingPanel.vue
```

---

# Props

Use typed props.

Example:

```ts
defineProps<{
  territory: Territory;
}>();
```

---

# Emits

Use typed emits.

Example:

```ts
const emit = defineEmits<{
  attack: [territoryId: string];
}>();
```

---

# Pinia Rules

Pinia stores UI state only.

Allowed:

```ts
selectedTerritory;
zoomLevel;
cameraPosition;
```

Not allowed:

```ts
battle logic
ownership rules
victory conditions
```

Those belong in Game Engine.

---

# PixiJS Conventions

Pixi only renders.

Never:

- Validate actions
- Calculate battles
- Change ownership

Pixi receives GameState.

Pixi displays GameState.

---

# Game Engine Rules

Pure functions only.

No:

- Vue
- Pixi
- Workers
- D1

Imports allowed:

```ts
types;
utilities;
rules;
services;
```

---

# Commands

All player actions are commands.

Example:

```ts
interface AttackCommand {
  type: "ATTACK";
  from: string;
  to: string;
  dice: number;
}
```

Commands express intent.

Never final state.

---

# Logging

Use structured logs.

Good:

```ts
console.log("attack-resolved", {
  attacker,
  defender,
});
```

Bad:

```ts
console.log("something happened");
```

---

# Error Handling

Expected errors:

Return Result.

Example:

```ts
{
  success: false,
  error: "INVALID_ATTACK"
}
```

Do not throw exceptions for game rule failures.

---

# Randomness

Never use:

```ts
Math.random();
```

Use:

```ts
RandomService(seed);
```

Required for:

- Replays
- Testing
- Multiplayer consistency

---

# Testing Requirements

Every service requires tests.

Examples:

```text
AttackService.ts
AttackService.test.ts
```

---

# Test Naming

Pattern:

```ts
describe("AttackService");
```

```ts
it("captures territory when defender reaches zero armies");
```

Use behavior-focused names.

---

# Coverage Targets

Game Engine:

95%

Workers:

90%

UI:

80%

---

# Magic Numbers

Never use unexplained numbers.

Bad:

```ts
if (territories > 42)
```

Good:

```ts
const TOTAL_TERRITORIES = 42;
```

---

# Constants

Store constants in:

```text
src/constants/
```

Examples:

```text
continents.ts
game-rules.ts
territories.ts
```

---

# Comments

Code should explain itself.

Avoid:

```ts
// increment armies
armies++;
```

Use comments only when:

- Explaining why
- Describing complex algorithms

---

# Dead Code

Never leave:

- Commented code
- Old implementations
- Unused imports

Remove immediately.

---

# Dependency Rules

Allowed:

UI
→ Network
→ Durable Object
→ Game Engine

Forbidden:

Game Engine
→ Vue

Game Engine
→ Pixi

Game Engine
→ D1

Pixi
→ Game Logic

Database
→ Rendering

---

# Definition of Done

A task is complete only when:

- TypeScript passes
- Linter passes
- Tests pass
- No console errors
- No unused imports
- No any types
- Documentation updated
- Architecture rules respected

---

# AI Agent Rules

Before creating code:

1. Check PRODUCT.md
2. Check ARCHITECTURE.md
3. Check AGENTS.md
4. Follow this document

Never invent architecture.

Never invent game rules.

Never bypass layering rules.

When uncertain, prefer consistency with existing codebase.

The existing codebase is always the source of truth.

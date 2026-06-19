# ARCHITECTURE.md

# Risk Online Architecture

## Purpose

This document defines the technical architecture of the project.

All contributors and AI agents must follow these rules.

Primary goals:

- Deterministic game logic
- Server authoritative multiplayer
- Clean separation of concerns
- Testable code
- Scalable architecture
- Fast rendering

---

# High Level Architecture

Frontend

Vue 3
↓
Pinia
↓
Pixi Renderer
↓
Command API
↓
WebSocket

Backend

Cloudflare Worker
↓
Durable Object (Match Server)
↓
Game Engine
↓
D1 Database

---

# Architectural Principles

## Single Source of Truth

GameState is authoritative.

All game decisions originate from GameState.

No duplicated ownership state.

No duplicated army counts.

No duplicated turn information.

---

## Server Authority

The server is always correct.

Clients are never trusted.

Clients may request actions.

Only the server may apply actions.

Examples:

Allowed:

- Attack request
- Reinforcement request
- Fortify request

Not allowed:

- Set army count
- Set owner
- End game

---

## Deterministic Game Engine

Game rules must be deterministic.

Given:

- State
- Action
- Random Seed

The result must always be identical.

Example:

applyAttack(state, action, seed)

Must always produce the same result.

---

## Immutable State

Never mutate GameState.

Bad:

state.armies = 5

Good:

return {
...state,
armies: 5
}

---

# Project Structure

src/

game-engine/
rendering/
stores/
components/
views/
network/
types/

workers/

durable-objects/
repositories/
routes/

tests/

---

# Frontend Layer

Responsibilities:

- UI
- Rendering
- User input

Must not:

- Calculate battles
- Validate attacks
- Determine winners

Frontend only displays state.

---

# Vue Layer

Responsibilities:

- Menus
- Lobby
- HUD
- Dialogs
- Settings

Example:

LobbyView.vue

GameView.vue

MatchResultView.vue

Vue never executes game rules.

---

# Pinia Layer

Purpose:

Store UI state.

Examples:

selectedTerritory

cameraPosition

zoomLevel

currentDialog

Do not store:

army calculations

ownership calculations

battle logic

turn rules

These belong to GameState.

---

# PixiJS Layer

Purpose:

Render map.

Responsibilities:

- Territory rendering
- Territory labels
- Selection indicators
- Animations
- Zoom
- Pan

Pixi is read-only.

Pixi must never modify game state.

---

# Network Layer

Purpose:

Communicate with server.

Responsibilities:

- WebSocket connection
- Reconnection
- Command sending
- State updates

Files:

network/GameSocket.ts

network/CommandClient.ts

---

# Backend Layer

Cloudflare Workers.

Handles:

- Routing
- Match creation
- Authentication (future)
- Durable Object access

Workers do not execute game logic directly.

---

# Durable Object Layer

One Durable Object equals one active match.

Responsibilities:

- Connected players
- Match state
- Turn management
- Action validation
- State broadcasting

Example:

match-123

Durable Object instance owns:

GameState

Player connections

Match metadata

---

# Game Engine Layer

Most important layer.

Responsible for all game rules.

Pure functions only.

No database access.

No network access.

No UI access.

No Pixi imports.

No Vue imports.

---

# Game Engine Structure

game-engine/

models/
services/
rules/

---

# Models

Player

Territory

Continent

GameState

Command

BattleResult

---

# Services

AttackService

ReinforcementService

FortificationService

VictoryService

TurnService

DiceService

---

# Rules

Pure validation functions.

Examples:

canAttack()

canFortify()

canPlaceReinforcements()

canEndTurn()

---

# Database Layer

Cloudflare D1

Responsibilities:

- Users
- Statistics
- Rankings
- Match history

Database never stores active game state.

Active state lives in Durable Objects.

---

# State Flow

Player clicks territory

↓

UI emits command

↓

Network sends command

↓

Durable Object receives command

↓

Game Engine validates command

↓

Game Engine returns new GameState

↓

Durable Object updates state

↓

Durable Object broadcasts state

↓

Clients rerender

---

# Command Architecture

All player actions are commands.

Examples:

PlaceReinforcementCommand

AttackCommand

FortifyCommand

EndTurnCommand

Commands contain intent only.

Never final state.

Good:

{
type: "ATTACK",
from: "BRAZIL",
to: "ARGENTINA",
dice: 3
}

Bad:

{
type: "SET_OWNER",
territory: "ARGENTINA",
owner: "player1"
}

---

# GameState Structure

interface GameState {

id: string;

phase:
| "reinforce"
| "attack"
| "fortify";

currentPlayerId: string;

players: Player[];

territories: Record<string, Territory>;

winnerId?: string;

turnNumber: number;

}

---

# Territory Storage

Use lookup tables.

Good:

territories["BRAZIL"]

O(1)

Bad:

territories.find(...)

O(n)

All territory access should use Record.

---

# Randomness

All randomness must be seedable.

Required for:

- Testing
- Replays
- Debugging

Never use:

Math.random()

Use:

RandomService(seed)

---

# Error Handling

Commands return:

Success

or

Domain Error

Examples:

NOT_YOUR_TURN

INVALID_ATTACK

INSUFFICIENT_ARMIES

INVALID_PHASE

UNKNOWN_TERRITORY

Never throw exceptions for expected gameplay errors.

---

# Reconnection Strategy

Player disconnects

↓

Connection removed

↓

Player remains in match

↓

Reconnect using player id

↓

Restore session

No state loss.

---

# Performance Targets

Map Rendering

60 FPS

State Update

< 100ms

Attack Resolution

< 20ms

Room Broadcast

< 250ms

Initial Load

< 3 seconds

---

# Testing Strategy

Unit Tests

Game Engine

Coverage target:

95%

Critical Tests:

- Reinforcements
- Battles
- Fortification
- Victory conditions

Integration Tests

- Durable Objects
- WebSocket flow

End-to-End

- Complete match simulation

---

# Security Rules

Never trust client input.

Validate:

- Ownership
- Army counts
- Turn order
- Phase rules

Server validates everything.

---

# Forbidden Dependencies

Game Engine must never import:

Vue

Pinia

PixiJS

Cloudflare APIs

Database code

WebSocket code

Game Engine must be framework independent.

---

# Dependency Direction

Allowed

UI
↓
Network
↓
Durable Object
↓
Game Engine

Forbidden

Game Engine
→ UI

Game Engine
→ Pixi

Database
→ Rendering

Pixi
→ Game Logic

---

# Future Extensions

Architecture must support:

- AI opponents
- Rankings
- Tournaments
- Replays
- Spectators

without changing Game Engine APIs.

---

# Definition of Architecture Success

The architecture is successful when:

- Game rules are isolated
- Rendering is isolated
- Networking is isolated
- Multiplayer remains authoritative
- State remains deterministic
- Features can be added without rewriting core systems

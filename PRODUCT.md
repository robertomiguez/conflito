# PRODUCT.md

# Risk Online

## Product Vision

Risk Online is a multiplayer world-conquest strategy game inspired by the classic board game Risk.

Players compete to control territories, conquer continents, eliminate opponents, and ultimately dominate the entire world map.

The game should be easy to learn, quick to play, and suitable for both casual and competitive players.

---

# Product Goals

## Primary Goals

- Simple and intuitive gameplay
- Fast matches
- Strategic decision making
- Fair multiplayer experience
- Mobile-friendly architecture
- Deterministic game engine
- Realtime multiplayer

## Secondary Goals

- Ranked ladder
- AI opponents
- Match statistics
- Replay system
- Tournaments

---

# Target Audience

### Casual Players

People who enjoy board games and strategy games.

### Competitive Players

Players interested in rankings, statistics, and tournaments.

### Platforms

- Desktop browsers
- Mobile browsers

No native mobile apps during MVP.

---

# Core Gameplay Loop

1. Join or create a match
2. Receive territories
3. Reinforce armies
4. Attack opponents
5. Fortify positions
6. End turn
7. Repeat until victory

---

# Match Rules

## Turn Structure

Each turn contains:

### Phase 1 - Reinforcement

Player receives armies based on:

- Territories owned
- Continent bonuses

Player places armies on owned territories.

### Phase 2 - Attack

Player may attack neighboring enemy territories.

Attacks are optional.

Player may perform unlimited attacks.

### Phase 3 - Fortify

Player may move armies between connected territories they own.

One fortification action per turn.

### Phase 4 - End Turn

Control passes to next player.

---

# Territories

The world is divided into territories.

Each territory contains:

- id
- name
- continent
- owner
- armies
- neighbors

Example:

Brazil

- Owner: Player 1
- Armies: 8
- Neighbors:
  - Argentina
  - Peru
  - Venezuela

---

# Continents

## North America

Bonus: +5

## South America

Bonus: +2

## Europe

Bonus: +5

## Africa

Bonus: +3

## Asia

Bonus: +7

## Australia

Bonus: +2

---

# Reinforcement Rules

At start of turn:

territoriesOwned / 3

Minimum reinforcement:

3 armies

Examples:

9 territories = 3 armies

12 territories = 4 armies

24 territories = 8 armies

Add continent bonuses when applicable.

---

# Battle Rules

## Attacker

May roll:

- 1 die
- 2 dice
- 3 dice

Cannot attack with last army.

Must leave one army behind.

## Defender

May roll:

- 1 die
- 2 dice

---

## Dice Resolution

Sort dice descending.

Compare highest dice.

Compare second highest dice if available.

For each comparison:

Higher die wins.

Defender wins ties.

---

## Example

Attacker:

6, 5, 2

Defender:

6, 4

Comparison:

6 vs 6

Defender wins.

5 vs 4

Attacker wins.

Result:

Attacker loses 1 army.

Defender loses 1 army.

---

# Territory Capture

When defender reaches zero armies:

1. Territory ownership changes.
2. Attacker moves armies into territory.
3. Minimum armies moved equals dice used.

Example:

Attack with 3 dice.

Captured territory.

Must move at least 3 armies.

---

# Fortification Rules

Player may move armies:

- Once per turn
- Between connected territories
- Through territories they own

Must leave at least one army behind.

---

# Elimination Rules

Player is eliminated when:

- Owns zero territories

Eliminated players leave turn order.

---

# Victory Condition

A player wins when:

- They own every territory on the map

Match immediately ends.

Victory screen displayed.

Statistics saved.

---

# Match Sizes

MVP:

- 2 players

Future:

- 3 players
- 4 players
- 5 players
- 6 players

---

# Multiplayer

## Features

- Create room
- Join room
- Room code
- Ready system
- Reconnect support

## Requirements

Game state is server authoritative.

Clients cannot directly modify state.

All actions must be validated by server.

---

# Chat

Phase 2 feature.

Players may chat during matches.

No private messages.

---

# AI Opponents

Phase 4 feature.

Difficulty levels:

- Easy
- Medium
- Hard

AI uses same rules as human players.

AI cannot cheat.

---

# Statistics

Track:

- Wins
- Losses
- Territories conquered
- Armies deployed
- Games played
- Average match duration

---

# Ranked Mode

Phase 4 feature.

Players receive rating.

Winning increases rating.

Losing decreases rating.

---

# Replay System

Phase 3 feature.

Store command history.

Allow match playback.

Allow pause and resume.

---

# Spectator Mode

Future feature.

Spectators can watch matches.

Spectators cannot interact.

---

# Visual Style

Modern strategy game.

Requirements:

- Clean UI
- Readable territory labels
- Smooth animations
- Zoom support
- Pan support

Map should feel similar to classic Risk but not copy copyrighted assets.

---

# Audio

Phase 3 feature.

Effects:

- Dice rolls
- Territory capture
- Victory
- Defeat

Background music optional.

---

# Performance Targets

Initial load:

< 3 seconds

Game actions:

< 100 ms

Multiplayer sync:

< 250 ms

Rendering:

60 FPS

---

# Technical Stack

Frontend:

- Vue 3
- TypeScript
- PixiJS
- Pinia

Backend:

- Cloudflare Workers
- Durable Objects
- D1

Testing:

- Vitest

---

# MVP Definition

The MVP is complete when:

- World map renders
- Territories can be selected
- Ownership is tracked
- Reinforcements work
- Battles work
- Fortification works
- Turn system works
- Victory condition works
- Multiplayer works for 2 players
- State synchronization works
- All core game rules are tested

---

# Explicit Non-Goals

Do not implement during MVP:

- Alliances
- Trading cards
- Fog of war
- Heroes
- Special units
- Buildings
- Resources
- Campaign mode
- Mobile apps
- Spectator mode
- Ranked mode
- Tournaments
- Replays
- AI players

These belong to later phases.

---

# Product Philosophy

The game should prioritize:

1. Simplicity
2. Fairness
3. Strategic depth
4. Fast gameplay
5. Reliable multiplayer

When making implementation decisions, prefer simpler solutions that preserve deterministic game rules and server authority.

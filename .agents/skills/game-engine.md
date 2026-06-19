# Game Engine Skill

Purpose:
Implement deterministic game rules.

Rules:

- Never mutate state.
- Always return new state.
- Pure functions only.
- No Pixi imports.
- No Vue imports.
- No network calls.

Patterns:

applyAttack(state, action)

applyReinforcement(state, action)

applyFortify(state, action)

validateAction(state, action)

Requirements:

- Unit tests mandatory.
- 100% deterministic.

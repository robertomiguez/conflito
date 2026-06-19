# Multiplayer Skill

Purpose:
Synchronize clients.

Rules:

- Durable Object is authoritative.
- Clients send commands.
- Server validates commands.

Flow:

Client
-> Command
-> Durable Object
-> Game Engine
-> New State
-> Broadcast

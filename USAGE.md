# Usage Guide

This document provides examples of how to use `rcon-node` to connect to the various supported game servers.

## Table of Contents

- [7 Days to Die](#connecting-to-a-7-days-to-die-server)
- [ARK: Survival Evolved](#connecting-to-an-ark-survival-evolved-server)
- [Arma Reforger](#connecting-to-an-arma-reforger-server)
- [DayZ](#connecting-to-a-dayz-server)
- [Minecraft](#connecting-to-a-minecraft-server)
- [Rust](#connecting-to-a-rust-server)

---

## Connecting to a 7 Days to Die Server

7 Days to Die uses a Telnet-like protocol over a standard TCP connection. The library handles the interactive login flow automatically. There is no formal public documentation for this protocol.

The client implementation for this game can be found at [`src/clients/seven-days-to-die.client.ts`](./src/clients/seven-days-to-die.client.ts).

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to a 7 Days to Die server
const rcon = await Rcon.connect({
  host: "localhost",
  port: 8081, // Default Telnet port for 7D2D
  password: "your_password",
  game: Game.SEVEN_DAYS_TO_DIE,
});

// Get the server version
const response = await rcon.send("version");
console.log(response);

rcon.end();
```

---

## Connecting to an ARK: Survival Evolved Server

ARK: Survival Evolved uses the standard Source RCON protocol over a TCP connection. You can find the unofficial but widely-accepted protocol specification on the [Valve Developer Wiki](https://developer.valvesoftware.com/wiki/Source_RCON_Protocol).

The client implementation for this game can be found at [`src/clients/ark-survival-evolved.client.ts`](./src/clients/ark-survival-evolved.client.ts).

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to an ARK: Survival Evolved server
const rcon = await Rcon.connect({
  host: "your.server.ip",
  port: 27020, // Your RCON port
  password: "your_password",
  game: Game.ARK_SURVIVAL_EVOLVED,
});

// Get a list of players
const response = await rcon.send("ListPlayers");
console.log(response);

rcon.end();
```

---

## Connecting to an Arma Reforger Server

Arma Reforger uses the BattlEye RCON protocol over UDP. The library handles the specifics of this protocol, including packet structure, checksums, and keep-alive messages. You can find the official protocol specification [here](https://www.battleye.com/downloads/BERConProtocol.txt).

The client implementation for this game can be found at [`src/clients/arma-reforger.client.ts`](./src/clients/arma-reforger.client.ts).

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to an Arma Reforger server
const rcon = await Rcon.connect({
  host: "your.server.ip",
  port: 2002, // Your BattlEye RCON port
  password: "your_password",
  game: Game.ARMA_REFORGER,
});

// Get a list of players
const response = await rcon.send("players");
console.log(response);

rcon.end();
```

---

## Connecting to a DayZ Server

DayZ uses the BattlEye RCON protocol over UDP. The library handles the specifics of this protocol, including packet structure, checksums, and keep-alive messages. You can find the official protocol specification [here](https://www.battleye.com/downloads/BERConProtocol.txt).

The client implementation for this game can be found at [`src/clients/dayz.client.ts`](./src/clients/dayz.client.ts).

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to a DayZ server
const rcon = await Rcon.connect({
  host: "your.server.ip",
  port: 2304, // Your BattlEye RCON port
  password: "your_password",
  game: Game.DAYZ,
});

// Get a list of players
const response = await rcon.send("players");
console.log(response);

rcon.end();
```

---

## Connecting to a Minecraft Server

Minecraft uses the standard Source RCON protocol over a TCP connection. You can find the unofficial but widely-accepted protocol specification on the [Valve Developer Wiki](https://developer.valvesoftware.com/wiki/Source_RCON_Protocol).

The client implementation for this game can be found at [`src/clients/minecraft.client.ts`](./src/clients/minecraft.client.ts).

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to a Minecraft server
const rcon = await Rcon.connect({
  host: "localhost",
  port: 25575,
  password: "password",
  game: Game.MINECRAFT,
});

const response = await rcon.send("say Hello from rcon-node!");
console.log(response);

rcon.end();
```

---

## Connecting to a Rust Server

Rust servers use a custom WebSocket-based protocol, sending and receiving JSON payloads. The library handles this automatically when you specify the correct game type.

The client implementation for this game can be found at [`src/clients/rust.client.ts`](./src/clients/rust.client.ts).

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to a Rust server
const rcon = await Rcon.connect({
  host: "localhost",
  port: 28016,
  password: "password",
  game: Game.RUST,
});

const response = await rcon.send("say Hello from rcon-node!");
console.log(response);

rcon.end();
```

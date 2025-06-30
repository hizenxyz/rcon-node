# Usage Guide

This document provides examples of how to use `rcon-node` to connect to the various supported game servers.

## Table of Contents

- [7 Days to Die](#connecting-to-a-7-days-to-die-server)
- [ARK: Survival Evolved](#connecting-to-an-ark-survival-evolved-server)
- [ARK: Survival Ascended](#connecting-to-an-ark-survival-ascended-server)
- [Arma Reforger](#connecting-to-an-arma-reforger-server)
- [DayZ](#connecting-to-a-dayz-server)
- [Minecraft](#connecting-to-a-minecraft-server)
- [SCUM](#connecting-to-a-scum-server)
- [Valheim](#connecting-to-a-valheim-server)
- [Palworld](#connecting-to-a-palworld-server)
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

## Connecting to an ARK: Survival Ascended Server

ARK: Survival Ascended uses the same Source RCON protocol as ARK: Survival Evolved.
The client implementation for this game can be found at [`src/clients/ark-survival-ascended.client.ts`](./src/clients/ark-survival-ascended.client.ts).

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to an ARK: Survival Ascended server
const rcon = await Rcon.connect({
  host: "your.server.ip",
  port: 27020, // Your RCON port
  password: "your_password",
  game: Game.ARK_SURVIVAL_ASCENDED,
});

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

## Connecting to a SCUM Server

SCUM uses the BattlEye RCON protocol over UDP. The library handles packet structure, checksums and keep-alive messages automatically. You can find the official protocol specification [here](https://www.battleye.com/downloads/BERConProtocol.txt).

The client implementation for this game can be found at [`src/clients/scum.client.ts`](./src/clients/scum.client.ts).

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to a SCUM server
const rcon = await Rcon.connect({
  host: "your.server.ip",
  port: 12345, // Your BattlEye RCON port
  password: "your_password",
  game: Game.SCUM,
});

const response = await rcon.send("help");
console.log(response);

rcon.end();
```

---

## Connecting to a Valheim Server

Valheim does not include native RCON functionality. To use `rcon-node` you must
install the [rcon](https://thunderstore.io/c/valheim/p/AviiNL/rcon/) plugin from
the [BepInExPack](https://thunderstore.io/c/valheim/p/denikson/BepInExPack_Valheim/).
After adding `rcon.dll` to your `BepInEx/plugins` folder, run the server once to
generate `BepInEx/config/nl.avii.plugins.rcon.cfg`. Set `enabled` to `true`,
choose a port and password, then restart the server.

The client implementation can be found at [`src/clients/valheim.client.ts`](./src/clients/valheim.client.ts).

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to a Valheim server
const rcon = await Rcon.connect({
  host: "localhost",
  port: 2458, // Port configured in the rcon plugin
  password: "password",
  game: Game.VALHEIM,
});

const response = await rcon.send("help");
console.log(response);

rcon.end();
```

---

## Connecting to a Palworld Server

Palworld uses the standard Source RCON protocol over a TCP connection. The library handles authentication and packet parsing automatically.

The client implementation for this game can be found at [`src/clients/palworld.client.ts`](./src/clients/palworld.client.ts).

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to a Palworld server
const rcon = await Rcon.connect({
  host: "localhost",
  port: 25575,
  password: "password",
  game: Game.PALWORLD,
});

const response = await rcon.send("Info");
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

# rcon-node

[![CI](https://github.com/hizenxyz/rcon-node/actions/workflows/ci.yml/badge.svg)](https://github.com/hizenxyz/rcon-node/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/rcon-client.svg)](https://www.npmjs.com/package/rcon-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript RCON client library for modern game servers.

This library allows you to connect to game servers using the RCON protocol to execute commands.

⚠️ **Note**: This is a new library and is under active development. The API may change.

## Features

- **Modern:** Uses modern TypeScript and ES modules.
- **Multi-Game Support:** Designed to support a variety of popular games.
- **Extensible:** Easily extendable to support new games and commands.
- **Lightweight:** No unnecessary dependencies.

## Supported Games

- [x] 7 Days to Die
- [ ] ARK: Survival Evolved
- [ ] DayZ
- [x] Minecraft
- [ ] Palworld
- [ ] Arma Reforger
- [x] Rust
- [ ] SCUM
- [ ] Valheim

## Installation

```bash
npm install rcon-node
```

## Quick Start

```typescript
import { Rcon, Game } from "rcon-node";

// Connect to a Minecraft server
const minecraftRcon = await Rcon.connect({
  host: "localhost",
  port: 25575,
  password: "password",
  game: Game.MINECRAFT,
});

const response = await minecraftRcon.send("say Hello from rcon-node!");
console.log(response);
minecraftRcon.end();

// Connect to a Rust server
const rustRcon = await Rcon.connect({
  host: "localhost",
  port: 28016,
  password: "password",
  game: Game.RUST,
});

const rustResponse = await rustRcon.send("say Hello from rcon-node!");
console.log(rustResponse);
rustRcon.end();
```

## Development

To get started with development:

1.  Clone the repository:
    ```bash
    git clone https://github.com/hizenxyz/rcon-node.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the tests:
    ```bash
    npm test
    ```

### Manual integration test

The test suite includes an optional integration test that connects to a real RCON server.
To run it, you first need to create a `.env.local` file in the root of the project.
The test configuration is controlled by these environment variables:

- `RCON_GAME`: The game to test against. This must match a value from the `Game` enum.
  - Possible values: `SEVEN_DAYS_TO_DIE`, `ARK_SURVIVAL_EVOLVED`, `DAYZ`, `MINECRAFT`, `PALWORLD`, `ARMA_REFORGER`, `RUST`, `SCUM`, `VALHEIM`
- `RCON_HOST`: The IP address of the RCON server.
- `RCON_PORT`: The port of the RCON server.
- `RCON_PASSWORD`: The RCON password.
- `RCON_SECURE`: Set to `true` for WebSocket (wss://) connections, used by games like Rust. Defaults to `false`.

**Example for Minecraft:**

```bash
RCON_GAME=MINECRAFT
RCON_HOST=127.0.0.1
RCON_PORT=25575
RCON_PASSWORD=secret
RCON_SECURE=false
```

**Example for Rust:**

```bash
RCON_GAME=RUST
RCON_HOST=127.0.0.1
RCON_PORT=28016
RCON_PASSWORD=secret
RCON_SECURE=false # Set to true if your server uses a wss:// connection
```

Then, you can run the integration tests using the following command:

```bash
npm run test:integration
```

If the `.env.local` file is not present or is missing variables, the integration test will be skipped. `vitest` automatically loads the environment variables from this file.

## Contributing

Contributions are welcome! If you'd like to add support for a new game, fix a bug, or improve the library, please open an issue or submit a pull request.

## Support

If you find this project helpful, consider supporting me on [Ko-fi](https://ko-fi.com/hizenxyz) ☕

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

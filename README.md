# rcon-node

[![CI](https://github.com/hizenxyz/rcon-node/actions/workflows/ci.yml/badge.svg)](https://github.com/hizenxyz/rcon-node/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/rcon-node.svg)](https://www.npmjs.com/package/rcon-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript RCON client library for modern game servers.

This library allows you to connect to game servers using the RCON protocol to execute commands.

⚠️ **A Note on Current Status**: This library is in active development, with a primary focus on ensuring reliable authentication with each supported game. While the connection and authentication processes are tested, please be aware that command handling for some games may be a partial implementation.

We welcome and encourage community contributions to expand functionality and improve compatibility. If you encounter any bugs or have a feature request, please feel free to open an issue or submit a pull request.

## Features

- **Modern:** Uses modern TypeScript and ES modules.
- **Multi-Game Support:** Designed to support a variety of popular games.
- **Extensible:** Easily extendable to support new games and commands.
- **Lightweight:** No unnecessary dependencies.

## Game Status

All games listed below are supported/tested for connection and authentication. While the core functionality is in place, please be aware that advanced command handling for some games may be a partial implementation. We welcome and encourage community contributions to expand functionality and improve compatibility.

Additionally, this is based on a default implementation of the vanilla server installs. Advanced modding or custom installs may potentially break functionality.

### Supported and Tested

- [x] 7 Days to Die
- [x] ARK: Survival Evolved
- [x] Arma Reforger
- [x] DayZ
- [x] Minecraft
- [x] Rust

### In Testing

### In Progress

- [ ] Palworld
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

For a fully redudant example set, please see the [Usage Guide](USAGE.md).

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

### Project Scripts

This project uses `npm` scripts to automate common development tasks.

- `npm run build`: Compiles the TypeScript code to JavaScript.
- `npm run dev`: Watches for file changes and recompiles automatically.
- `npm run lint`: Lints the codebase for style and quality errors using ESLint.
- `npm run format`: Formats the code using Prettier.
- `npm run test`: Runs the test suite.
- `npm run test:integration`: Runs the integration tests against a live server (requires `.env.local` configuration).
- `npm run ci`: Runs the full continuous integration suite, including type checking, linting, and fast tests.

#### A Note on `npm ci`

It's important to understand the difference between two common commands:

- **`npm ci`**: This is a built-in `npm` command that performs a clean install of dependencies from the `package-lock.json` file. It **does not** run any of the project's custom scripts.
- **`npm run ci`**: This command executes the custom `"ci"` script defined in `package.json`, which runs a series of checks (type checking, linting, and testing).

The pre-commit hooks for this project use `npm run lint`, so it's possible for a commit to fail the lint check even if `npm ci` completes successfully.

### Manual integration test

The test suite includes an optional integration test that connects to a real RCON server.
To run it, you first need to create a `.env.local` file in the root of the project.
The test configuration is controlled by these environment variables:

- `RCON_GAME`: The game to test against. This must match a value from the `Game` enum.
  - Possible values: `SEVEN_DAYS_TO_DIE`, `ARK_SURVIVAL_EVOLVED`, `ARMA_REFORGER`, `DAYZ`, `MINECRAFT`, `PALWORLD`, `RUST`, `SCUM`, `VALHEIM`
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

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

- [ ] 7 Days to Die
- [ ] ARK: Survival Evolved
- [ ] DayZ
- [ ] Minecraft
- [ ] Palworld
- [ ] Arma Reforger
- [ ] Rust
- [ ] SCUM
- [ ] Valheim

## Installation

```bash
npm install rcon-node
```

## Quick Start (Planned Implementation)

```typescript
import { Rcon } from "rcon-node";

const rcon = new Rcon({
  host: "localhost",
  port: 25575,
  password: "password",
});

rcon.on("connect", () => {
  console.log("Connected to RCON server!");
});

rcon.on("authenticated", () => {
  console.log("Authenticated!");
  rcon.send("say Hello from rcon-node!");
});

rcon.on("response", (response) => {
  console.log("Server response:", response);
});

rcon.on("error", (error) => {
  console.error("RCON error:", error);
});

rcon.on("end", () => {
  console.log("RCON connection closed.");
});

rcon.connect();
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
To run it, you first need to create a `.env.local` file in the root of the project with the following content:

```bash
RCON_HOST=127.0.0.1
RCON_PORT=25575
RCON_PASSWORD=secret
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

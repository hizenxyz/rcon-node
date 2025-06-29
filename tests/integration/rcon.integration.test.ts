import { describe, it, expect } from "vitest";
import { Rcon, Game } from "../../src/index";

const host = process.env.RCON_HOST;
const port = process.env.RCON_PORT;
const password = process.env.RCON_PASSWORD;
const secure = process.env.RCON_SECURE === "true";
const gameString = process.env.RCON_GAME;

const game = Object.values(Game).includes(gameString as Game)
  ? (gameString as Game)
  : undefined;

const missing = !host || !port || !password || !game;

function getCommandAndExpected(game: Game) {
  switch (game) {
    case Game.ARMA_REFORGER:
      return { command: "players", expected: "Players" };
    case Game.SEVEN_DAYS_TO_DIE:
      return { command: "version", expected: "Version" };
    case Game.ARK_SURVIVAL_EVOLVED:
      return { command: "ListPlayers", expected: "Players" };
    default:
      return { command: "echo test", expected: "test" };
  }
}

describe("RCON integration", () => {
  it.skipIf(missing)(
    `connects to a ${game ?? "server"}`,
    async () => {
      let rcon: Rcon | null = null;
      try {
        rcon = await Rcon.connect({
          host: host!,
          port: parseInt(port!, 10),
          password: password!,
          game,
          secure,
        });
        expect(rcon).toBeInstanceOf(Rcon);

        const { command, expected } = getCommandAndExpected(game!);

        const response = await rcon.send(command);
        expect(response).toContain(expected);
      } finally {
        rcon?.end();
      }
    },
    10000
  );
});

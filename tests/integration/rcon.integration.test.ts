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
      } finally {
        rcon?.end();
      }
    },
    10000
  );

  it.skipIf(missing)("throws an error with wrong password", async () => {
    let rcon: Rcon | null = null;
    await expect(async () => {
      try {
        rcon = await Rcon.connect({
          host: host!,
          port: parseInt(port!, 10),
          password: `${password!}invalid`,
          game,
          secure,
        });
      } finally {
        rcon?.end();
      }
    }).rejects.toThrow();
  });
});

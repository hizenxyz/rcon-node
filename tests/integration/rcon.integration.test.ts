import { describe, it, expect } from "vitest";
import { Rcon } from "../../src/index";

const host = process.env.RCON_HOST;
const port = process.env.RCON_PORT;
const password = process.env.RCON_PASSWORD;

const missing = !host || !port || !password;

describe("RCON integration", () => {
  it.skipIf(missing)(
    "connects and authenticates with a real server",
    async () => {
      let rcon: Rcon | null = null;
      try {
        rcon = await Rcon.connect({
          host: host!,
          port: parseInt(port!, 10),
          password: password!,
        });
        expect(rcon).toBeInstanceOf(Rcon);
        const response = await rcon.send("echo test");
        expect(response).toContain("test");
      } finally {
        rcon?.end();
      }
    }
  );
});

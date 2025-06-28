import { describe, it, expect } from "vitest";
import { isAuth } from "../../src/helpers";

const host = process.env.RCON_HOST;
const port = process.env.RCON_PORT;
const password = process.env.RCON_PASSWORD;

const missing = !host || !port || !password;

describe("RCON integration", () => {
  it.skipIf(missing)(
    "connects and authenticates with a real server",
    async () => {
      const authenticated = await isAuth(
        {
          host: host!,
          port: parseInt(port!, 10),
          password: password!,
        },
        5000
      );
      expect(authenticated).toBe(true);
    },
    10000
  );
});

import { describe, it, expect } from "vitest";
import { isAuth } from "../../src/helpers";

const host = process.env.RCON_HOST;
const port = process.env.RCON_PORT;
const password = process.env.RCON_PASSWORD;

const missing = !host || !port || !password;

const testFn = missing ? it.skip : it;

describe("RCON integration", () => {
  testFn(
    "connects and authenticates with a real server" +
      (missing ? " (set RCON_HOST, RCON_PORT and RCON_PASSWORD to run)" : ""),
    async () => {
      if (missing) return;
      const authenticated = await isAuth({
        host: host!,
        port: parseInt(port!, 10),
        password: password!,
      });
      expect(authenticated).toBe(true);
    }
  );
});

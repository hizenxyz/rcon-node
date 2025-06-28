import { Rcon, type RconOptions } from "./rcon";

export async function isAuth(
  options: RconOptions,
  timeout?: number
): Promise<boolean> {
  return new Promise((resolve) => {
    const rcon = new Rcon(options);
    let settled = false;

    const cleanup = () => {
      rcon.off("authenticated", onAuth);
      rcon.off("error", onFail);
      rcon.off("end", onFail);
    };

    const done = (result: boolean) => {
      if (!settled) {
        settled = true;
        cleanup();
        rcon.end();
        resolve(result);
      }
    };

    const onAuth = () => done(true);
    const onFail = () => done(false);

    rcon.on("authenticated", onAuth);
    rcon.on("error", onFail);
    rcon.on("end", onFail);

    rcon.connect(timeout);
  });
}

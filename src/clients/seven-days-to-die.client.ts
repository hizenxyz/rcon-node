import { Socket, createConnection } from "node:net";
import { BaseClient } from "./base.client";
import { readUntil, sendAndRead } from "../utils/seven-days-to-die.utils";

export class SevenDaysToDieClient extends BaseClient {
  private socket: Socket | null = null;
  private authenticated = false;

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createConnection(
        {
          host: this.options.host,
          port: this.options.port,
        },
        async () => {
          this.emit("connect");
          try {
            if (!this.socket) {
              return reject(new Error("Socket closed."));
            }

            await readUntil(this.socket, /password[:]?/i);
            this.socket.write(`${this.options.password}\n`);
            await readUntil(this.socket, /Press 'exit' to end session/i);
            this.authenticated = true;
            this.emit("authenticated");
            resolve();
          } catch (err) {
            this.end();
            reject(err as Error);
          }
        }
      );

      this.socket.on("error", (err) => this.emit("error", err));
      this.socket.on("end", () => {
        this.authenticated = false;
        this.emit("end");
      });
    });
  }

  public async send(command: string): Promise<string> {
    if (!this.socket || !this.authenticated) {
      throw new Error("Not authenticated.");
    }

    const data = await sendAndRead(this.socket, command, /\n/);
    return data.trim();
  }

  public end(): void {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
      this.authenticated = false;
    }
  }

  public async testAuthentication(): Promise<void> {
    const response = await this.send("version");
    if (!response.includes("Version")) {
      throw new Error("Authentication failed.");
    }
  }
}

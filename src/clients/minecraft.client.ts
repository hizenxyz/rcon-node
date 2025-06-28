import { Socket, createConnection } from "node:net";
import { BaseClient } from "./base.client";
import {
  createPacket,
  PACKET_TYPE_AUTH,
  PACKET_TYPE_AUTH_RESPONSE,
  PACKET_TYPE_COMMAND,
  PACKET_TYPE_RESPONSE,
} from "../utils/packet";

export class MinecraftClient extends BaseClient {
  private socket: Socket | null = null;
  private requestId = 0;
  private pending = new Map<number, (data: string) => void>();
  private connected = false;
  private authenticated = false;
  private buffer = Buffer.alloc(0);
  private authCallback: ((err?: Error) => void) | null = null;

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createConnection(
        {
          host: this.options.host,
          port: this.options.port,
        },
        () => {
          this.connected = true;
          this.emit("connect");
          this.authenticate().then(resolve).catch(reject);
        }
      );

      this.socket.on("data", (data) => this.onData(data));
      this.socket.on("error", (err) => this.emit("error", err));
      this.socket.on("end", () => {
        this.connected = false;
        this.authenticated = false;
        this.emit("end");
      });

      if (this.options.timeout) {
        this.socket.setTimeout(this.options.timeout, () => {
          if (!this.connected) {
            const err = new Error("Connection timed out.");
            this.emit("error", err);
            this.end();
            reject(err);
          }
        });
      }
    });
  }

  private authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.authCallback?.(new Error("Authentication timed out."));
      }, this.options.timeout ?? 5000);

      this.authCallback = (err) => {
        clearTimeout(timeout);
        if (err) {
          this.end();
          reject(err);
        } else {
          this.authenticated = true;
          this.emit("authenticated");
          resolve();
        }
        this.authCallback = null;
      };

      this.sendPacket(PACKET_TYPE_AUTH, this.options.password).catch((err) => {
        this.authCallback?.(err);
      });
    });
  }

  private onData(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data]);

    while (this.buffer.length >= 4) {
      const size = this.buffer.readInt32LE(0);
      if (this.buffer.length < 4 + size) {
        break;
      }

      const packet = this.buffer.subarray(4, 4 + size);
      this.buffer = this.buffer.subarray(4 + size);

      const id = packet.readInt32LE(0);
      const type = packet.readInt32LE(4);

      if (this.authCallback) {
        if (type === PACKET_TYPE_AUTH_RESPONSE) {
          if (id === -1) {
            this.authCallback(new Error("Authentication failed."));
          } else if (id === this.requestId) {
            this.authCallback();
          }
        } else if (type === PACKET_TYPE_RESPONSE) {
          // Minecraft sends an empty SERVERDATA_RESPONSE_VALUE before the auth response, which can be ignored.
        }
        continue;
      }

      if (type === PACKET_TYPE_RESPONSE) {
        const body = packet.toString("utf8", 8, packet.length - 2);
        const resolve = this.pending.get(id);
        if (resolve) {
          resolve(body);
          this.pending.delete(id);
        } else {
          this.emit("response", body);
        }
      }
    }
  }

  public send(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.authenticated) {
        return reject(new Error("Not authenticated."));
      }
      this.sendPacket(PACKET_TYPE_COMMAND, command)
        .then((id) => {
          this.pending.set(id, resolve);
        })
        .catch(reject);
    });
  }

  private sendPacket(type: number, body: string): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error("Socket not connected."));
      }

      const id = ++this.requestId;
      const buffer = createPacket(id, type, body);

      this.socket.write(buffer, (err) => {
        if (err) {
          return reject(err);
        }
        resolve(id);
      });
    });
  }

  public end(): void {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
  }
}

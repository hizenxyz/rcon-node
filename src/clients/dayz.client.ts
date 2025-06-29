import { createSocket, Socket } from "node:dgram";
import { BaseClient } from "./base.client";
import {
  createLoginPacket,
  createCommandPacket,
  parsePacket,
} from "../utils/dayz.utils";

export class DayzClient extends BaseClient {
  private socket: Socket | null = null;
  private sequence = 0;
  private pending = new Map<number, (data: string) => void>();
  private authCallback: ((err?: Error) => void) | null = null;

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createSocket("udp4");

      const onError = (err: Error): void => {
        this.end();
        reject(err);
      };

      this.socket.once("error", onError);
      this.socket.on("message", (msg) => this.onMessage(msg));
      this.socket.on("close", () => this.emit("end"));

      const timeout = setTimeout(() => {
        onError(new Error("Connection timed out."));
      }, this.options.timeout ?? 5000);

      this.socket.connect(this.options.port, this.options.host, () => {
        clearTimeout(timeout);
        this.emit("connect");
        this.authenticate()
          .then(() => {
            this.socket?.off("error", onError);
            resolve();
          })
          .catch(reject);
      });
    });
  }

  private authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.authCallback?.(new Error("Authentication timed out."));
      }, this.options.timeout ?? 5000);

      this.authCallback = (err?: Error): void => {
        clearTimeout(timeout);
        if (err) {
          this.end();
          reject(err);
        } else {
          this.emit("authenticated");
          resolve();
        }
        this.authCallback = null;
      };

      const packet = createLoginPacket(this.options.password);
      this.socket?.send(packet, (err) => {
        if (err) {
          this.authCallback?.(err);
        }
      });
    });
  }

  private onMessage(data: Buffer): void {
    const packet = parsePacket(data);
    if (!packet) {
      return;
    }

    if (packet.type === "auth") {
      if (this.authCallback) {
        if (packet.success) {
          this.authCallback();
        } else {
          this.authCallback(new Error("Authentication failed."));
        }
      }
      return;
    }

    const resolver = this.pending.get(packet.sequence);
    if (resolver) {
      resolver(packet.payload ?? "");
      this.pending.delete(packet.sequence);
    } else if (packet.payload) {
      this.emit("response", packet.payload);
    }
  }

  public send(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error("Socket not connected."));
      }
      const seq = ++this.sequence % 256;
      this.pending.set(seq, resolve);
      const packet = createCommandPacket(seq, command);
      this.socket.send(packet, (err) => {
        if (err) {
          this.pending.delete(seq);
          reject(err);
        }
      });
    });
  }

  public end(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

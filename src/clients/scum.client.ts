import { createSocket, Socket } from "node:dgram";
import { BaseClient } from "./base.client";
import {
  createCommandPacket,
  createLoginPacket,
  parsePacket,
  SCUM_PACKET_TYPE_COMMAND,
  SCUM_PACKET_TYPE_LOGIN,
} from "../utils/scum.utils";

export class ScumClient extends BaseClient {
  private socket: Socket | null = null;
  private sessionId = 0;
  private requestId = 0;
  private pending = new Map<number, (data: string) => void>();
  private connectResolver: (() => void) | null = null;

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createSocket("udp4");
      this.connectResolver = resolve;

      const timeout = setTimeout(() => {
        reject(new Error("Connection timed out."));
        this.end();
      }, this.options.timeout ?? 5000);

      const onError = (err: Error): void => {
        clearTimeout(timeout);
        this.end();
        reject(err);
      };

      this.socket.once("error", onError);
      this.socket.on("message", (msg) => {
        try {
          const packet = parsePacket(msg);
          if (packet.type === SCUM_PACKET_TYPE_LOGIN) {
            clearTimeout(timeout);
            this.sessionId = packet.id;
            this.emit("connect");
            this.emit("authenticated");
            this.connectResolver?.();
            this.connectResolver = null;
          } else if (packet.type === SCUM_PACKET_TYPE_COMMAND) {
            const cb = this.pending.get(packet.id);
            if (cb) {
              cb(packet.payload);
              this.pending.delete(packet.id);
            } else {
              this.emit("response", packet.payload);
            }
          } else {
            this.emit("response", packet.payload);
          }
        } catch (err) {
          this.emit("error", err as Error);
        }
      });

      this.socket.on("close", () => this.emit("end"));

      const loginPacket = createLoginPacket(this.options.password);
      this.socket.send(
        loginPacket,
        this.options.port,
        this.options.host,
        (err) => {
          if (err) {
            onError(err);
          }
        }
      );
    });
  }

  public send(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.sessionId === 0) {
        return reject(new Error("Not connected."));
      }
      const id = ++this.requestId;
      this.pending.set(id, resolve);
      const packet = createCommandPacket(this.sessionId, id, command);
      this.socket.send(packet, this.options.port, this.options.host, (err) => {
        if (err) {
          this.pending.delete(id);
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

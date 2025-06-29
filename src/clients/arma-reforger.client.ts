import { Socket, createSocket } from "node:dgram";
import { BaseClient } from "./base.client";
import {
  ArmaReforgerResponseType,
  createAuthPacket,
  createCommandPacket,
  parsePacket,
} from "../utils/arma-reforger.utils";

export class ArmaReforgerClient extends BaseClient {
  private socket: Socket | null = null;
  private seq = 0;

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createSocket("udp4");
      const socket = this.socket;

      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error("Authentication timed out."));
      }, this.options.timeout ?? 5000);

      const onMessage = (msg: Buffer): void => {
        const packet = parsePacket(msg);
        if (packet.type === ArmaReforgerResponseType.AUTH) {
          socket.off("message", onMessage);
          clearTimeout(timeout);
          if (packet.success) {
            this.emit("connect");
            this.emit("authenticated");
            socket.on("message", (data) => this.handleMessage(data));
            resolve();
          } else {
            socket.close();
            reject(new Error("Authentication failed."));
          }
        }
      };

      socket.on("message", onMessage);
      socket.on("error", (err) => {
        socket.close();
        reject(err);
      });
      socket.on("close", () => this.emit("end"));

      const packet = createAuthPacket(this.options.password);
      socket.send(packet, this.options.port, this.options.host);
    });
  }

  private handleMessage(msg: Buffer): void {
    const packet = parsePacket(msg);
    if (packet.type === ArmaReforgerResponseType.COMMAND) {
      this.emit("response", packet.payload);
    }
  }

  public send(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error("Socket not connected."));
      }

      const seq = this.seq++ & 0xff;
      const packet = createCommandPacket(seq, command);

      const onMessage = (msg: Buffer): void => {
        const data = parsePacket(msg);
        if (
          data.type === ArmaReforgerResponseType.COMMAND &&
          data.seq === seq
        ) {
          this.socket?.off("message", onMessage);
          resolve(data.payload);
        }
      };

      this.socket.on("message", onMessage);
      this.socket.send(packet, this.options.port, this.options.host, (err) => {
        if (err) {
          this.socket?.off("message", onMessage);
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

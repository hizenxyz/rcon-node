import { Socket, createSocket } from "node:dgram";
import { BaseClient } from "./base.client";
import {
  ScumPacketType,
  createAckPacket,
  createCommandPacket,
  createLoginPacket,
  parsePacket,
} from "../utils/scum.utils";

export class ScumClient extends BaseClient {
  private socket: Socket | null = null;
  private seq = 0;
  private keepAlive: NodeJS.Timeout | null = null;

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
        if (packet.type === ScumPacketType.LOGIN) {
          socket.off("message", onMessage);
          clearTimeout(timeout);
          if (packet.success) {
            this.emit("connect");
            this.emit("authenticated");
            socket.on("message", (data) => this.handleMessage(data));
            this.keepAlive = setInterval(() => {
              // BattlEye requires a keep-alive packet every <45 seconds.
              // An empty command packet is sufficient.
              this.send("");
            }, 30_000);
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
      socket.on("close", () => {
        if (this.keepAlive) {
          clearInterval(this.keepAlive);
        }
        this.emit("end");
      });

      const packet = createLoginPacket(this.options.password);
      socket.send(packet, this.options.port, this.options.host);
    });
  }

  private handleMessage(msg: Buffer): void {
    try {
      const packet = parsePacket(msg);

      if (packet.type === ScumPacketType.MESSAGE) {
        this.emit("response", packet.payload.toString("ascii"));
        if (this.socket) {
          const ack = createAckPacket(packet.seq);
          this.socket.send(ack, this.options.port, this.options.host);
        }
      } else if (packet.type === ScumPacketType.COMMAND) {
        // These are responses to commands sent via `send()`
        // and are handled by listeners on the socket there.
      }
    } catch (e) {
      this.emit("error", e as Error);
    }
  }

  public send(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error("Socket not connected."));
      }

      const seq = this.seq;
      this.seq = (this.seq + 1) & 0xff;

      const packet = createCommandPacket(seq, command);

      const onMessage = (msg: Buffer): void => {
        try {
          const data = parsePacket(msg);
          if (data.type === ScumPacketType.COMMAND && data.seq === seq) {
            this.socket?.off("message", onMessage);
            resolve(data.payload.toString("ascii"));
          }
        } catch {
          // Ignore parsing errors for other packet types
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

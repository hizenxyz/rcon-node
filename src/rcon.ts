import net from "node:net";
import { EventEmitter } from "node:events";
import { encodePacket, decodePacket, RconPacket } from "./packet";

export interface RconOptions {
  host: string;
  port: number;
  password: string;
}

export class Rcon extends EventEmitter {
  private socket: net.Socket;
  private options: RconOptions;
  private buffer = Buffer.alloc(0);
  private requestId = 0;
  private pending = new Map<number, (data: string) => void>();
  private authId: number | null = null;

  constructor(options: RconOptions, socket?: net.Socket) {
    super();
    this.options = options;
    this.socket = socket ?? new net.Socket();
  }

  connect(timeout?: number): void {
    this.socket.on("connect", this.onConnect);
    this.socket.on("data", this.onData);
    this.socket.on("error", (err) => this.emit("error", err));
    this.socket.on("end", () => this.emit("end"));
    this.socket.on("close", () => this.emit("end"));
    if (timeout) {
      this.socket.setTimeout(timeout);
      this.socket.on("timeout", () => {
        this.socket.destroy(new Error(`Socket timeout after ${timeout}ms`));
      });
    }
    this.socket.connect(this.options.port, this.options.host);
  }

  send(command: string): Promise<string> {
    const id = this.nextId();
    const packet = encodePacket({ id, type: 2, body: command });

    return new Promise((resolve, reject) => {
      this.pending.set(id, resolve);
      this.socket.write(packet, (err) => {
        if (err) {
          this.pending.delete(id);
          reject(err);
        }
      });
    });
  }

  end(): void {
    this.socket.end();
  }

  private nextId(): number {
    this.requestId += 1;
    return this.requestId;
  }

  private onConnect = () => {
    this.emit("connect");
    this.authenticate();
  };

  private authenticate(): void {
    this.authId = this.nextId();
    const packet = encodePacket({
      id: this.authId,
      type: 3,
      body: this.options.password,
    });
    this.socket.write(packet);
  }

  private onData = (chunk: Buffer) => {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer.length >= 4) {
      const length = this.buffer.readInt32LE(0);
      if (this.buffer.length < length + 4) break;
      const packetBuffer = this.buffer.subarray(0, length + 4);
      this.buffer = this.buffer.subarray(length + 4);

      let packet: RconPacket;
      try {
        packet = decodePacket(packetBuffer);
      } catch (err) {
        this.emit("error", err);
        continue;
      }

      this.handlePacket(packet);
    }
  };

  private handlePacket(packet: RconPacket): void {
    if (
      this.authId !== null &&
      packet.id === this.authId &&
      packet.type === 2
    ) {
      if (packet.id === -1) {
        this.emit("error", new Error("Authentication failed"));
        this.socket.end();
      } else {
        this.emit("authenticated");
      }
      return;
    }

    const pending = this.pending.get(packet.id);
    if (pending) {
      this.pending.delete(packet.id);
      pending(packet.body);
    }
    this.emit("response", packet.body);
  }
}

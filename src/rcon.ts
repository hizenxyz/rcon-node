import { EventEmitter } from "node:events";
import WebSocket from "ws";

export interface RconOptions {
  host: string;
  port: number;
  password: string;
  secure?: boolean;
}

export class Rcon extends EventEmitter {
  private socket: WebSocket | null = null;
  private options: RconOptions;
  private requestId = 0;
  private pending = new Map<number, (data: string) => void>();

  constructor(options: RconOptions) {
    super();
    this.options = options;
  }

  connect(): void {
    const protocol = this.options.secure ? "wss" : "ws";
    const url = `${protocol}://${this.options.host}:${this.options.port}/${this.options.password}`;
    this.socket = new WebSocket(url);

    this.socket.on("open", () => {
      this.emit("connect");
      this.emit("authenticated");
    });

    this.socket.on("message", (data) => {
      const message = JSON.parse(data.toString());
      const pending = this.pending.get(message.Identifier);
      if (pending) {
        this.pending.delete(message.Identifier);
        pending(message.Message);
      } else {
        this.emit("response", message.Message);
      }
    });

    this.socket.on("error", (err) => {
      this.emit("error", err);
    });

    this.socket.on("close", () => {
      this.emit("end");
    });
  }

  send(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        return reject(new Error("WebSocket not open."));
      }

      this.requestId++;
      this.pending.set(this.requestId, resolve);

      const packet = {
        Identifier: this.requestId,
        Message: command,
        Name: "WebRcon",
      };

      this.socket.send(JSON.stringify(packet), (err) => {
        if (err) {
          this.pending.delete(this.requestId);
          reject(err);
        }
      });
    });
  }

  end(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  public static connect(options: RconOptions): Promise<Rcon> {
    const rcon = new Rcon(options);
    return new Promise<Rcon>((resolve, reject) => {
      const onError = (err: Error): void => {
        rcon.end();
        reject(err);
      };

      rcon.once("authenticated", () => {
        rcon.off("error", onError);
        resolve(rcon);
      });

      rcon.once("error", onError);

      rcon.connect();
    });
  }
}

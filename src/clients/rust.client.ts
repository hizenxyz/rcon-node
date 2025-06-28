import WebSocket from "ws";
import { BaseClient } from "./base.client";

export class RustClient extends BaseClient {
  private socket: WebSocket | null = null;
  private requestId = 0;
  private pending = new Map<number, (data: string) => void>();

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = this.options.secure ? "wss" : "ws";
      const url = `${protocol}://${this.options.host}:${this.options.port}/${this.options.password}`;
      this.socket = new WebSocket(url);

      const onError = (err: Error): void => {
        this.end();
        reject(err);
      };

      this.socket.on("open", () => {
        this.socket?.off("error", onError);
        this.emit("connect");
        this.emit("authenticated");
        resolve();
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

      this.socket.on("error", onError);
      this.socket.on("close", () => this.emit("end"));
    });
  }

  public send(command: string): Promise<string> {
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

  public end(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}

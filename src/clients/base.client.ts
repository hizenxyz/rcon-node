import { EventEmitter } from "node:events";
import type { RconOptions } from "../rcon";

export abstract class BaseClient extends EventEmitter {
  protected options: RconOptions;

  constructor(options: RconOptions) {
    super();
    this.options = options;
  }

  abstract connect(): Promise<void>;
  abstract send(command: string): Promise<string>;
  abstract end(): void;

  public async testAuthentication(): Promise<void> {
    const response = await this.send("echo test");
    if (!response.includes("test")) {
      throw new Error("Authentication failed.");
    }
  }
}

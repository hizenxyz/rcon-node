import { BaseClient } from "./base.client";

export class ArmaReforgerClient extends BaseClient {
  public connect(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public send(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  public end(): void {
    throw new Error("Method not implemented.");
  }
}

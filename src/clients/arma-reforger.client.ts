import { BattlEyeClient } from "./battleye.client";

export class ArmaReforgerClient extends BattlEyeClient {
  public async testAuthentication(): Promise<void> {
    const response = await this.send("players");
    if (!response.toLowerCase().includes("players")) {
      throw new Error("Authentication failed.");
    }
  }
}

import { BattlEyeClient } from "./battleye.client";

export class ScumClient extends BattlEyeClient {
  public async testAuthentication(): Promise<void> {
    const response = await this.send("players");
    if (!response.toLowerCase().includes("player")) {
      throw new Error("Authentication failed.");
    }
  }
}

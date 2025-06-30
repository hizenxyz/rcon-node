import { EventEmitter } from "node:events";
import { Game } from "./game";
import type { BaseClient } from "./clients/base.client";
import { MinecraftClient } from "./clients/minecraft.client";
import { RustClient } from "./clients/rust.client";
import { SevenDaysToDieClient } from "./clients/seven-days-to-die.client";
import { ArkSurvivalEvolvedClient } from "./clients/ark-survival-evolved.client";
import { ArkSurvivalAscendedClient } from "./clients/ark-survival-ascended.client";
import { DayZClient } from "./clients/dayz.client";
import { PalworldClient } from "./clients/palworld.client";
import { ArmaReforgerClient } from "./clients/arma-reforger.client";
import { ScumClient } from "./clients/scum.client";
import { ValheimClient } from "./clients/valheim.client";

export interface RconOptions {
  host: string;
  port: number;
  password: string;
  game?: Game;
  secure?: boolean;
  timeout?: number;
}

export class Rcon extends EventEmitter {
  private client: BaseClient;

  constructor(options: RconOptions) {
    super();

    switch (options.game) {
      case Game.RUST:
        this.client = new RustClient(options);
        break;
      case Game.SEVEN_DAYS_TO_DIE:
        this.client = new SevenDaysToDieClient(options);
        break;
      case Game.ARK_SURVIVAL_EVOLVED:
        this.client = new ArkSurvivalEvolvedClient(options);
        break;
      case Game.ARK_SURVIVAL_ASCENDED:
        this.client = new ArkSurvivalAscendedClient(options);
        break;
      case Game.DAYZ:
        this.client = new DayZClient(options);
        break;
      case Game.PALWORLD:
        this.client = new PalworldClient(options);
        break;
      case Game.ARMA_REFORGER:
        this.client = new ArmaReforgerClient(options);
        break;
      case Game.SCUM:
        this.client = new ScumClient(options);
        break;
      case Game.VALHEIM:
        this.client = new ValheimClient(options);
        break;
      case Game.MINECRAFT:
      default:
        this.client = new MinecraftClient(options);
        break;
    }

    this.client.on("connect", () => this.emit("connect"));
    this.client.on("authenticated", () => this.emit("authenticated"));
    this.client.on("response", (response: string) =>
      this.emit("response", response)
    );
    this.client.on("error", (error: Error) => this.emit("error", error));
    this.client.on("end", () => this.emit("end"));
  }

  public send(command: string): Promise<string> {
    return this.client.send(command);
  }

  public end(): void {
    this.client.end();
  }

  public static async connect(options: RconOptions): Promise<Rcon> {
    const rcon = new Rcon(options);
    await rcon.client.connect();
    await rcon.client.testAuthentication();
    return rcon;
  }
}

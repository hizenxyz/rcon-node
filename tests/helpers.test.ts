import { describe, it, expect, vi } from "vitest";

const instances: any[] = [];

vi.mock("../src/rcon", async () => {
  const { EventEmitter } = await import("node:events");
  return {
    __esModule: true,
    Rcon: class MockRcon extends EventEmitter {
      connect = vi.fn();
      end = vi.fn();
      constructor() {
        super();
        instances.push(this);
      }
    },
  };
});

import { isAuth } from "../src/helpers";

describe("isAuth", () => {
  it("resolves true when authenticated", async () => {
    const promise = isAuth({ host: "h", port: 1, password: "p" } as any);
    const inst = instances.pop()!;
    inst.emit("authenticated");
    await expect(promise).resolves.toBe(true);
    expect(inst.end).toHaveBeenCalled();
  });

  it("resolves false on error", async () => {
    const promise = isAuth({ host: "h", port: 1, password: "p" } as any);
    const inst = instances.pop()!;
    inst.emit("error", new Error("fail"));
    await expect(promise).resolves.toBe(false);
    expect(inst.end).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "node:events";
import { Rcon, RconOptions } from "../src";
import { encodePacket, decodePacket } from "../src/packet";

class MockSocket extends EventEmitter {
  public written: Buffer[] = [];
  connect(_port: number, _host: string) {
    void _port;
    void _host;
    this.emit("connect");
  }
  write(data: Buffer, cb?: (err?: Error | null) => void) {
    this.written.push(Buffer.from(data));
    cb?.(null);
    return true;
  }
  end() {
    this.emit("end");
  }
  send(buffer: Buffer) {
    this.emit("data", buffer);
  }
}

describe("Rcon class", () => {
  const options: RconOptions = {
    host: "localhost",
    port: 27015,
    password: "p",
  };

  it("authenticates and sends commands", async () => {
    const socket = new MockSocket();
    const rcon = new Rcon(options, socket as any);

    const onConnect = vi.fn();
    const onAuth = vi.fn();
    const onResponse = vi.fn();
    const onEnd = vi.fn();
    rcon.on("connect", onConnect);
    rcon.on("authenticated", onAuth);
    rcon.on("response", onResponse);
    rcon.on("end", onEnd);

    rcon.connect();
    expect(onConnect).toHaveBeenCalled();

    const authPacket = decodePacket(socket.written.shift()!);
    expect(authPacket.body).toBe(options.password);

    socket.send(encodePacket({ id: authPacket.id, type: 2, body: "" }));
    expect(onAuth).toHaveBeenCalled();

    const promise = rcon.send("status");
    const cmdPacket = decodePacket(socket.written.shift()!);
    expect(cmdPacket.body).toBe("status");

    const respBuf = encodePacket({ id: cmdPacket.id, type: 0, body: "ok" });
    socket.send(respBuf.subarray(0, 5));
    socket.send(respBuf.subarray(5));

    await expect(promise).resolves.toBe("ok");
    expect(onResponse).toHaveBeenCalledWith("ok");

    socket.end();
    expect(onEnd).toHaveBeenCalled();
  });
});

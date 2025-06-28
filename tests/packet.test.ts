import { describe, it, expect } from "vitest";
import { encodePacket, decodePacket } from "../src/packet";

const sample = { id: 1, type: 2, body: "hello" };

describe("RCON packet", () => {
  it("encodes and decodes correctly", () => {
    const encoded = encodePacket(sample);
    const decoded = decodePacket(encoded);
    expect(decoded).toEqual(sample);
  });

  it("throws on length mismatch", () => {
    const encoded = encodePacket(sample);
    encoded.writeInt32LE(1, 0); // corrupt length
    expect(() => decodePacket(encoded)).toThrow();
  });

  it("throws when terminators missing", () => {
    const encoded = encodePacket(sample);
    const truncated = encoded.subarray(0, encoded.length - 1);
    expect(() => decodePacket(truncated)).toThrow();
  });
});

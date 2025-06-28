import { Buffer } from "node:buffer";

export const PACKET_TYPE_AUTH = 3;
export const PACKET_TYPE_COMMAND = 2;
export const PACKET_TYPE_RESPONSE = 0;
export const PACKET_TYPE_AUTH_RESPONSE = 2;

/**
 * Creates a packet buffer for the Valve RCON protocol.
 * @param id The packet identifier.
 * @param type The packet type (e.g., auth, command).
 * @param body The packet body/payload.
 * @returns The constructed packet as a Buffer.
 */
export function createPacket(id: number, type: number, body: string): Buffer {
  const bodyBuffer = Buffer.from(body, "utf8");
  const buffer = Buffer.alloc(14 + bodyBuffer.length);

  buffer.writeInt32LE(10 + bodyBuffer.length, 0);
  buffer.writeInt32LE(id, 4);
  buffer.writeInt32LE(type, 8);
  buffer.write(body, 12, "utf8");
  buffer.writeInt8(0, 12 + bodyBuffer.length);
  buffer.writeInt8(0, 13 + bodyBuffer.length);

  return buffer;
}

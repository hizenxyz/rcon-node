export interface ValheimPacket {
  id: number;
  type: number;
  body: string;
}

import { createPacket } from "./packet";

export function buildValheimPacket(
  id: number,
  type: number,
  body: string
): Buffer {
  return createPacket(id, type, body);
}

export function extractValheimPackets(buffer: Buffer): {
  packets: ValheimPacket[];
  remaining: Buffer;
} {
  const packets: ValheimPacket[] = [];
  let offset = 0;

  while (buffer.length - offset >= 4) {
    const size = buffer.readInt32LE(offset);
    if (buffer.length - offset < 4 + size) {
      break;
    }

    const packetBuf = buffer.subarray(offset + 4, offset + 4 + size);
    const id = packetBuf.readInt32LE(0);
    const type = packetBuf.readInt32LE(4);
    const body = packetBuf.toString("ascii", 8, packetBuf.length - 2);
    packets.push({ id, type, body });
    offset += 4 + size;
  }

  return { packets, remaining: buffer.subarray(offset) };
}

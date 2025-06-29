export interface RconPacket {
  id: number;
  type: number;
  body: string;
}

export function parsePackets(buffer: Buffer): {
  packets: RconPacket[];
  remaining: Buffer;
} {
  const packets: RconPacket[] = [];
  let offset = 0;
  while (buffer.length >= offset + 4) {
    const size = buffer.readInt32LE(offset);
    if (buffer.length < offset + 4 + size) {
      break;
    }
    const packetBuf = buffer.subarray(offset + 4, offset + 4 + size);
    const id = packetBuf.readInt32LE(0);
    const type = packetBuf.readInt32LE(4);
    const body = packetBuf.toString("utf8", 8, packetBuf.length - 2);
    packets.push({ id, type, body });
    offset += 4 + size;
  }
  const remaining = buffer.subarray(offset);
  return { packets, remaining };
}

export interface RconPacket {
  id: number;
  type: number;
  body: string;
}

export function encodePacket(packet: RconPacket): Buffer {
  const bodyBuffer = Buffer.from(packet.body, "utf8");
  const length = bodyBuffer.length + 10; // id + type + body + 2 null terminators
  const buffer = Buffer.allocUnsafe(4 + length);

  let offset = 0;
  buffer.writeInt32LE(length, offset);
  offset += 4;
  buffer.writeInt32LE(packet.id, offset);
  offset += 4;
  buffer.writeInt32LE(packet.type, offset);
  offset += 4;
  bodyBuffer.copy(buffer, offset);
  offset += bodyBuffer.length;
  buffer.writeInt16LE(0, offset); // two null terminators

  return buffer;
}

export function decodePacket(buffer: Buffer): RconPacket {
  if (buffer.length < 14) {
    throw new Error("Packet too short");
  }

  const length = buffer.readInt32LE(0);
  if (buffer.length < length + 4) {
    throw new Error("Incomplete packet");
  }

  const id = buffer.readInt32LE(4);
  const type = buffer.readInt32LE(8);
  const bodyLength = length - 10;
  if (bodyLength < 0) {
    throw new Error("Invalid body length");
  }

  const body = buffer.slice(12, 12 + bodyLength).toString("utf8");
  const null1 = buffer[12 + bodyLength];
  const null2 = buffer[12 + bodyLength + 1];
  if (null1 !== 0 || null2 !== 0) {
    throw new Error("Missing null terminator");
  }

  return { id, type, body };
}

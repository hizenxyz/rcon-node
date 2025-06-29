export const SCUM_PACKET_TYPE_LOGIN = 0x00;
export const SCUM_PACKET_TYPE_COMMAND = 0x01;
export const SCUM_PACKET_TYPE_MESSAGE = 0x02;

export interface ScumPacket {
  type: number;
  id: number;
  payload: string;
}

export function createLoginPacket(password: string): Buffer {
  const pwd = Buffer.from(password + "\0", "utf8");
  const buf = Buffer.alloc(7 + pwd.length);
  buf.write("BE", 0, "ascii");
  buf.writeUInt8(SCUM_PACKET_TYPE_LOGIN, 2);
  buf.writeUInt32BE(0, 3); // login has id 0
  pwd.copy(buf, 7);
  return buf;
}

export function createCommandPacket(
  sessionId: number,
  id: number,
  command: string
): Buffer {
  const body = Buffer.from(command + "\0", "utf8");
  const buf = Buffer.alloc(11 + body.length);
  buf.write("BE", 0, "ascii");
  buf.writeUInt8(SCUM_PACKET_TYPE_COMMAND, 2);
  buf.writeUInt32BE(sessionId, 3);
  buf.writeUInt32BE(id, 7);
  body.copy(buf, 11);
  return buf;
}

export function parsePacket(data: Buffer): ScumPacket {
  if (data.toString("ascii", 0, 2) !== "BE") {
    throw new Error("Invalid packet header");
  }
  const type = data.readUInt8(2);
  const id = data.readUInt32BE(3);
  const payload =
    data.length > 7 ? data.toString("utf8", 7).replace(/\0+$/, "") : "";
  return { type, id, payload };
}

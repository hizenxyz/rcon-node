export enum ArmaReforgerPacketType {
  AUTH = 0,
  COMMAND = 1,
}

export enum ArmaReforgerResponseType {
  AUTH = 0,
  COMMAND = 1,
}

export interface ParsedPacket {
  type: ArmaReforgerResponseType;
  seq: number;
  payload: string;
  success?: boolean;
}

export function createAuthPacket(password: string): Buffer {
  const pw = Buffer.from(password, "utf8");
  const buf = Buffer.alloc(6 + pw.length);
  buf.write("BE", 0, "ascii");
  buf.writeUInt8(0x00, 2);
  buf.writeUInt8(0xff, 3);
  buf.writeUInt8(ArmaReforgerPacketType.AUTH, 4);
  pw.copy(buf, 5);
  buf.writeUInt8(0x00, 5 + pw.length);
  return buf;
}

export function createCommandPacket(seq: number, command: string): Buffer {
  const cmd = Buffer.from(command, "utf8");
  const buf = Buffer.alloc(6 + cmd.length);
  buf.write("BE", 0, "ascii");
  buf.writeUInt8(0x00, 2);
  buf.writeUInt8(seq & 0xff, 3);
  buf.writeUInt8(ArmaReforgerPacketType.COMMAND, 4);
  cmd.copy(buf, 5);
  buf.writeUInt8(0x00, 5 + cmd.length);
  return buf;
}

export function parsePacket(buf: Buffer): ParsedPacket {
  const type =
    buf[4] === ArmaReforgerPacketType.AUTH
      ? ArmaReforgerResponseType.AUTH
      : ArmaReforgerResponseType.COMMAND;
  const seq = buf[3];
  const payload = buf.toString("utf8", 5, buf.length);
  const success =
    type === ArmaReforgerResponseType.AUTH
      ? payload.trim() === "OK"
      : undefined;
  return { type, seq, payload, success };
}

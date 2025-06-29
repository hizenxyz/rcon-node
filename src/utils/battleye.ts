import crc32 from "crc-32";

export enum BattlEyePacketType {
  LOGIN = 0x00,
  COMMAND = 0x01,
  MESSAGE = 0x02,
}

export interface ParsedBattlEyePacket {
  type: BattlEyePacketType;
  seq: number;
  payload: Buffer;
  success?: boolean;
}

const HEADER = Buffer.from([0x42, 0x45]);

const createPayload = (
  type: BattlEyePacketType,
  ...args: (string | number | Buffer)[]
): Buffer => {
  const parts: Buffer[] = [Buffer.from([type])];
  for (const arg of args) {
    if (typeof arg === "string") {
      parts.push(Buffer.from(arg, "ascii"));
    } else if (typeof arg === "number") {
      parts.push(Buffer.from([arg]));
    } else {
      parts.push(arg);
    }
  }

  return Buffer.concat(parts);
};

const buildPacket = (payload: Buffer): Buffer => {
  const checksumContent = Buffer.concat([Buffer.from([0xff]), payload]);
  const checksum = Buffer.alloc(4);
  checksum.writeInt32LE(crc32.buf(checksumContent), 0);

  // 0xFF is also part of the final packet header
  return Buffer.concat([HEADER, checksum, Buffer.from([0xff]), payload]);
};

export const createLoginPacket = (password: string): Buffer => {
  const payload = createPayload(BattlEyePacketType.LOGIN, password);
  return buildPacket(payload);
};

export const createCommandPacket = (seq: number, command: string): Buffer => {
  const payload = createPayload(BattlEyePacketType.COMMAND, seq, command);
  return buildPacket(payload);
};

export const createAckPacket = (seq: number): Buffer => {
  const payload = createPayload(BattlEyePacketType.MESSAGE, seq);
  return buildPacket(payload);
};

export const parseBattlEyePacket = (buf: Buffer): ParsedBattlEyePacket => {
  if (buf.toString("ascii", 0, 2) !== "BE") {
    throw new Error("Invalid BattlEye packet header.");
  }

  const payload = buf.slice(7);

  const checksumContent = Buffer.concat([Buffer.from([0xff]), payload]);
  const checksum = buf.readInt32LE(2);
  const receivedChecksum = crc32.buf(checksumContent);

  if (checksum !== receivedChecksum) {
    throw new Error(
      `Invalid checksum. Expected ${receivedChecksum} but got ${checksum}`
    );
  }

  const type = payload.readUInt8(0);
  let seq = -1;
  let body: Buffer;
  let success: boolean | undefined = undefined;

  switch (type) {
    case BattlEyePacketType.LOGIN:
      success = payload.readUInt8(1) === 1;
      body = payload.slice(2);
      break;
    case BattlEyePacketType.COMMAND:
      seq = payload.readUInt8(1);
      body = payload.slice(2);
      break;
    case BattlEyePacketType.MESSAGE:
      seq = payload.readUInt8(1);
      body = payload.slice(2);
      break;
    default:
      throw new Error("Unknown packet type");
  }

  return { type, seq, payload: body, success };
};

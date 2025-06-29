export enum DayzPacketType {
  LOGIN = 0,
  COMMAND = 1,
  SERVER_MESSAGE = 2,
}

export interface DayzParsedPacket {
  sequence: number;
  type: "auth" | "response" | "server";
  success?: boolean;
  payload?: string;
}

export function createLoginPacket(password: string): Buffer {
  const passBuf = Buffer.from(password, "utf8");
  const buffer = Buffer.alloc(6 + passBuf.length);
  buffer.write("BE", 0, 2, "ascii");
  buffer[2] = 0x00;
  buffer[3] = 0x00;
  buffer[4] = 0xff;
  buffer[5] = DayzPacketType.LOGIN;
  passBuf.copy(buffer, 6);
  return buffer;
}

export function createCommandPacket(sequence: number, command: string): Buffer {
  const cmdBuf = Buffer.from(command, "utf8");
  const buffer = Buffer.alloc(6 + cmdBuf.length);
  buffer.write("BE", 0, 2, "ascii");
  buffer[2] = 0x00;
  buffer[3] = sequence;
  buffer[4] = 0xff;
  buffer[5] = DayzPacketType.COMMAND;
  cmdBuf.copy(buffer, 6);
  return buffer;
}

export function parsePacket(buffer: Buffer): DayzParsedPacket | null {
  if (buffer.length < 6 || buffer[0] !== 0x42 || buffer[1] !== 0x45) {
    return null;
  }

  const sequence = buffer[3];
  const type = buffer[5];

  if (type === DayzPacketType.LOGIN) {
    const success = buffer[6] === 0x01;
    return { sequence, type: "auth", success };
  }

  const payload = buffer.toString("utf8", 6);
  if (type === DayzPacketType.COMMAND) {
    return { sequence, type: "response", payload };
  }

  return { sequence, type: "server", payload };
}

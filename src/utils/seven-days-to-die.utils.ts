export type Matcher = RegExp | string;

import type { Socket } from "node:net";

/**
 * Wait until the socket receives data matching the provided pattern.
 * @param socket The TCP socket.
 * @param matcher String or regular expression to match.
 * @returns Resolves with the received data once the matcher is satisfied.
 */
export function readUntil(socket: Socket, matcher: Matcher): Promise<string> {
  return new Promise((resolve) => {
    let buffer = "";
    const isMatch = (data: string): boolean =>
      typeof matcher === "string" ? data.includes(matcher) : matcher.test(data);

    const onData = (chunk: Buffer): void => {
      buffer += chunk.toString();
      if (isMatch(buffer)) {
        socket.off("data", onData);
        resolve(buffer);
      }
    };

    socket.on("data", onData);
  });
}

/**
 * Send a command to the socket and read until the pattern is seen again.
 * @param socket The TCP socket.
 * @param command Command text to send.
 * @param matcher Pattern signalling the end of the response.
 * @returns Resolves with the captured response text.
 */
export async function sendAndRead(
  socket: Socket,
  command: string,
  matcher: Matcher
): Promise<string> {
  socket.write(command.endsWith("\n") ? command : `${command}\n`);
  const data = await readUntil(socket, matcher);
  return data;
}

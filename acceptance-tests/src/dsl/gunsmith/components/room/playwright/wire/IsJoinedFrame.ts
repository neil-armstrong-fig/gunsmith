/** Whether a text frame from the server is the one that seats a browser, by how the server writes it (`{"kind":"joined",...`): sent once on every connection. */
export function isJoinedFrame(frame: string): boolean {
  return frame.startsWith('{"kind":"joined"');
}

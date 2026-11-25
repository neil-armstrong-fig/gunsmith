/** Whether a text frame from the server is the reveal, by how the server writes it (`{"kind":"reveal",...`), without reading the rest of it. */
export function isRevealFrame(frame: string): boolean {
  return frame.startsWith('{"kind":"reveal"');
}

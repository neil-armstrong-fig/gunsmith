/** Whether a text frame from the server is a snapshot, by how the server writes it (`{"kind":"snapshot",...`), without reading the rest of it. */
export function isSnapshotFrame(frame: string): boolean {
  return frame.startsWith('{"kind":"snapshot"');
}

import type {ReceivedSnapshot} from "@src/dsl/gunsmith/components/room/playwright/wire/types/ReceivedSnapshot";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The `snapshot` frames among the text frames a browser received, in order. A frame that is not JSON, or not a snapshot, is skipped. */
export function snapshotsOfFrames(frames: readonly string[]): readonly ReceivedSnapshot[] {
  const snapshots: ReceivedSnapshot[] = [];

  for (const frame of frames) {
    const snapshot = snapshotOfFrame(frame);
    if (snapshot) {
      snapshots.push(snapshot);
    }
  }

  return snapshots;
}

function snapshotOfFrame(frame: string): ReceivedSnapshot | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(frame);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }

  if (Reflect.get(parsed, "kind") !== "snapshot") {
    return undefined;
  }

  const snapshot: ReceivedSnapshot = {};
  const opponent: unknown = Reflect.get(parsed, "opponent");
  if (opponent !== undefined && opponent !== null) {
    snapshot.opponent = opponent;
  }

  const pickup: unknown = Reflect.get(parsed, "pickup");
  if (pickup !== undefined && pickup !== null) {
    snapshot.pickup = pickup;
  }

  const position = positionOfPlayer(Reflect.get(parsed, "player"));
  if (position) {
    snapshot.position = position;
  }

  const events: unknown = Reflect.get(parsed, "events");
  if (Array.isArray(events)) {
    snapshot.events = events;
  }

  const elapsedSeconds: unknown = Reflect.get(parsed, "elapsedSeconds");
  if (typeof elapsedSeconds === "number") {
    snapshot.elapsedSeconds = elapsedSeconds;
  }

  return snapshot;
}

/** The position inside a `player` field of a frame, or `undefined` when it holds none. */
function positionOfPlayer(player: unknown): Point | undefined {
  if (typeof player !== "object" || player === null) {
    return undefined;
  }

  const position: unknown = Reflect.get(player, "position");
  if (typeof position !== "object" || position === null) {
    return undefined;
  }

  const x: unknown = Reflect.get(position, "x");
  const y: unknown = Reflect.get(position, "y");
  if (typeof x !== "number" || typeof y !== "number") {
    return undefined;
  }

  return {x, y};
}

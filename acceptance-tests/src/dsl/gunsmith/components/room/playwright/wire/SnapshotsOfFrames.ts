import type {ReceivedSnapshot} from "@src/dsl/gunsmith/components/room/playwright/wire/types/ReceivedSnapshot";

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

  const opponent: unknown = Reflect.get(parsed, "opponent");
  if (opponent === undefined || opponent === null) {
    return {};
  }

  return {opponent};
}

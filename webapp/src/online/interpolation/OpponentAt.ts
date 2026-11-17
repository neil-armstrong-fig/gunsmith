import type {Player} from "@gunsmith/engine/player/types/Player";
import {blendFighters} from "@src/online/interpolation/blend/BlendFighters";
import type {SnapshotOfOpponent} from "@src/online/interpolation/types/SnapshotOfOpponent";

/**
 * The other fighter as they stood at `seconds` of the server's game time, from the snapshots (oldest first): blended between the two either
 * side of that time, so a fighter moves smoothly though snapshots come in steps. It never draws what the server did not say:
 * - a fighter the server stopped telling of is held where they were last seen until the time reaches the snapshot without them, then gone;
 * - a fighter is not drawn before the snapshot that first holds them;
 * - past the newest snapshot, or before the oldest, the nearest one is held, not extrapolated.
 */
export function opponentAt(snapshots: readonly SnapshotOfOpponent[], seconds: number): Player | undefined {
  const newestBefore = snapshots.filter(snapshot => snapshot.elapsedSeconds <= seconds).at(-1);
  if (!newestBefore) {
    return snapshots[0]?.opponent;
  }

  const next = snapshots.find(snapshot => snapshot.elapsedSeconds > seconds);
  if (!newestBefore.opponent || !next?.opponent) {
    return newestBefore.opponent;
  }

  const span = next.elapsedSeconds - newestBefore.elapsedSeconds;

  return blendFighters({
    from: newestBefore.opponent,
    to: next.opponent,
    share: (seconds - newestBefore.elapsedSeconds) / span,
  });
}

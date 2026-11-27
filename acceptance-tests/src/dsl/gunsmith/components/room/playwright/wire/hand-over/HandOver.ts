import type {Buffer} from "node:buffer";
import {withSavedWeapon} from "@src/dsl/gunsmith/components/room/playwright/wire/hand-over/saved-weapon/WithSavedWeapon";
import {isSnapshotFrame} from "@src/dsl/gunsmith/components/room/playwright/wire/hand-over/snapshot-frame/IsSnapshotFrame";
import type {HandOverSettings} from "@src/dsl/gunsmith/components/room/playwright/wire/hand-over/types/HandOverSettings";

/**
 * What one connection hands the page of each frame the server sends: rewritten to carry a saved weapon when a spec asked for one, the other
 * seat's saved weapon told once (as the server tells it once a connection), and only every `n`th snapshot when a spec thins them. A new
 * connection gets a new one, so its counts start again as the server's do.
 */
export class HandOver {
  private snapshots = 0;
  private weaponTold = false;

  constructor(private readonly settings: HandOverSettings) {}

  /** The frames to hand the page, in order, for one the server sent: none, one, or more than one. */
  framesFor(sent: string | Buffer): readonly (string | Buffer)[] {
    return this.rewritten(sent).filter(frame => this.isHandedOver(frame));
  }

  private rewritten(sent: string | Buffer): readonly (string | Buffer)[] {
    if (!this.settings.savedWeaponHolder || typeof sent !== "string") {
      return [sent];
    }

    return withSavedWeapon(sent, this.settings.savedWeaponHolder);
  }

  private isHandedOver(frame: string | Buffer): boolean {
    if (typeof frame !== "string") {
      return true;
    }
    if (frame.startsWith('{"kind":"opponentWeapon"')) {
      return this.isWeaponToldFirst();
    }
    if (isSnapshotFrame(frame)) {
      return this.isSnapshotKept();
    }

    return true;
  }

  /** Whether this is the first time the other seat's saved weapon is told on this connection, which it then has been. */
  private isWeaponToldFirst(): boolean {
    if (this.weaponTold) {
      return false;
    }

    this.weaponTold = true;

    return true;
  }

  /** Whether this snapshot is one of every `n`th, the first among them, counting it. */
  private isSnapshotKept(): boolean {
    this.snapshots += 1;

    return (this.snapshots - 1) % this.settings.snapshotsPerHandover === 0;
  }
}

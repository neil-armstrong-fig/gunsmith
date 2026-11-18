import type {SeatTokenStorage} from "@src/online/seat-token/types/SeatTokenStorage";

/**
 * Keeps the token a room gave this browser for its seat, in the tab's own session storage, so a reload (or a tab that comes back to the
 * room) shows it and gets the same seat. Session storage, not local: a second tab is another person and must not inherit the seat, and
 * it goes away with the tab. Storage can be missing or refuse (private windows, blocked site data), so nothing here throws: without it
 * the browser simply has no seat to come back to.
 */
export class SeatTokenKeeper {
  constructor(
    private readonly storageOfPage: () => SeatTokenStorage,
    private readonly code: string,
  ) {}

  /** The token saved for this room, or `undefined`. */
  read(): string | undefined {
    try {
      return this.storageOfPage().getItem(this.name()) ?? undefined;
    } catch {
      return undefined;
    }
  }

  save(token: string): void {
    try {
      this.storageOfPage().setItem(this.name(), token);
    } catch {
      // No storage: the seat cannot be come back to, and the match is no worse for it.
    }
  }

  private name(): string {
    return `gunsmith-seat-token-${this.code}`;
  }
}

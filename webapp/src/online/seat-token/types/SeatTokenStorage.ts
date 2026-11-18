/** The part of the browser's `Storage` a seat's token uses, so a test can stand a plain object in its place. */
export interface SeatTokenStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

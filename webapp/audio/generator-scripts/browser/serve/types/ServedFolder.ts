/** A folder being served on this machine: the address to open and how to stop serving it. */
export interface ServedFolder {
  /** The address with no trailing slash, as `http://127.0.0.1:41234`. */
  url: string;
  close: () => Promise<void>;
}

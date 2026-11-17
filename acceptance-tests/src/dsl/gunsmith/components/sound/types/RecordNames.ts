/** The names, on `window`, of the three records the sound recorder keeps in the page. */
export interface RecordNames {
  /** The list of sounds started. */
  plays: string;
  /** Which address each fetched byte array came from. */
  urlOfBytes: string;
  /** Which address each decoded buffer came from. */
  urlOfBuffer: string;
}

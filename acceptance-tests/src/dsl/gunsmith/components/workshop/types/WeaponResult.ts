/** The result card for a made weapon, as the screen shows it. */
export interface WeaponResult {
  name: string;
  /** The power rating, whole, as the card prints it. */
  rating: number;
  /** Each stat row's label with the number the card prints (`Damage` with `12`), as plain text. */
  stats: Readonly<Record<string, string>>;
  /** The address the card's drawing is loaded from. */
  pictureAddress: string;
  /** Whether the browser has decoded the drawing, so a broken picture does not pass for one. */
  pictureLoaded: boolean;
}

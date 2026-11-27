/** One weapon on the reveal as the screen prints it: its name, its power rating and each stat row. */
export interface RevealedWeaponNumbers {
  name: string;
  /** The power rating, whole, as the reveal prints it. */
  rating: number;
  /** Each stat row's label with the value the reveal prints (`Damage` with `12`), as plain text. */
  stats: Readonly<Record<string, string>>;
}

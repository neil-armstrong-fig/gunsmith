/** One saved weapon as the shelf shows it. */
export interface ShelfItem {
  name: string;
  /** The power rating, whole, as the shelf prints it. */
  rating: number;
  /** The words the weapon was made from, as the shelf shows them. */
  prompt: string;
}

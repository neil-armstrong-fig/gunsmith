/** Two distances along a ray, one where a point is seen and one where it is not, with the edge of sight somewhere between them. */
export interface Transition {
  seen: number;
  hidden: number;
}

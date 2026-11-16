/** How a fighter looks on the screen, counted by colour over places sampled where they are drawn. */
export interface FighterLook {
  /** How many places over the drawing show the body's grey. */
  bodyPixels: number;

  /** How many show their team's colour (the stripes). */
  teamPixels: number;

  /** How many show a pale grey, which only the placeholder's barrel has (tone mapping paled it, so it is not an exact shade). */
  placeholderPixels: number;

  /** How many of the eight compass points, the width of the circle walls stop from the fighter's centre, show the body's outline: 8 means the body is drawn centred and as big as that circle. */
  outlinePoints: number;
}

/** How a shot in the air looks on the screen, counted by colour over places sampled round where the game says it is. */
export interface ShotLook {
  /** How many of the places along the flight, behind the tip, show the shooter's team colour (all of them for a drawn bar, lying along the way it flies). */
  alongPoints: number;

  /** How many of those same places show the other team's colour (none: the two sides' shots are different shades). */
  otherTeamAlongPoints: number;

  /** How many places to either side of the bar show the team colour (none: the bar is thin). */
  acrossPoints: number;

  /** How many places just ahead of where the bullet is show it (none: the bar's tip is on the bullet, so it never looks buried in what it hits). */
  aheadPoints: number;

  /** How many places past the bar's tail show it (none: the bar is as long as it is drawn). */
  beyondTailPoints: number;

  /** How many places right at the bullet show the placeholder's gold, which only the stand-in disc has. */
  placeholderPoints: number;
}

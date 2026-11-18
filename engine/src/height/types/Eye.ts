/** What decides what a viewer's sight is stopped by: the level their eye looks from and whether they crouch, which puts it below a low cover block. */
export interface Eye {
  /** The level the viewer looks from: ground on a higher level hides what is on it and behind it, ground on their own level or lower does not. */
  eyeLevel: number;
  /** Whether the viewer crouches: a crouching eye sees over no cover block on its own level, a standing one sees over them all. */
  crouching: boolean;
}

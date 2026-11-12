/** What is left of `health` after `damage` lands. It stops at zero: nobody has less than none. */
export function takeDamage(health: number, damage: number): number {
  return Math.max(0, health - damage);
}

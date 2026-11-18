import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";
import type {Strike} from "@gunsmith/engine/dummy/types/Strike";

/**
 * The dummies after being hit. `strikes` holds one entry per bullet that landed, with the dummy it landed on and the
 * damage that bullet does, so a dummy hit twice appears twice and takes both. A dummy left with no health is not in the
 * list that comes back.
 */
export function hurtDummies(dummies: readonly Dummy[], strikes: readonly Strike[]): Dummy[] {
  const hurt: Dummy[] = [];

  dummies.forEach((dummy, index) => {
    const damage = strikes
      .filter(strike => strike.dummyIndex === index)
      .reduce((total, strike) => total + strike.damage, 0);
    const health = dummy.health - damage;
    if (health > 0) {
      hurt.push({...dummy, health});
    }
  });

  return hurt;
}

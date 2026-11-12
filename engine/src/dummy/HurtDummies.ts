import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";

/**
 * The dummies after being hit. `hits` holds one entry per bullet that landed: the index of the dummy it landed on, so a
 * dummy hit twice appears twice and takes the damage twice. A dummy left with no health is not in the list that comes back.
 */
export function hurtDummies(dummies: readonly Dummy[], hits: readonly number[], damage: number): Dummy[] {
  const hurt: Dummy[] = [];

  dummies.forEach((dummy, index) => {
    const hitsTaken = hits.filter(hit => hit === index).length;
    const health = dummy.health - damage * hitsTaken;

    if (health > 0) {
      hurt.push({position: dummy.position, health});
    }
  });

  return hurt;
}

import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {ratingPercentOf} from "@src/react/components/dom/workshop/rating-percent/RatingPercentOf";

it.each([RIFLE, MARKSMAN_RIFLE, SUBMACHINE_GUN])("is a whole number from 0 to 100 for $identity.name", weapon => {
  const rating = ratingPercentOf(weapon);

  expect(Number.isInteger(rating)).toBe(true);
  expect(rating).toBeGreaterThanOrEqual(0);
  expect(rating).toBeLessThanOrEqual(100);
});

it("tells weapons that rate differently apart", () => {
  expect(new Set([RIFLE, MARKSMAN_RIFLE, SUBMACHINE_GUN].map(ratingPercentOf)).size).toBeGreaterThan(1);
});

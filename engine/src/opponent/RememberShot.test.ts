import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import {rememberShot} from "@gunsmith/engine/opponent/RememberShot";

const SHOOTER = {x: 12.5, y: 3.5};
const brain = startingBrain({seed: 1, position: {x: 3.5, y: 3.5}});

it("remembers where the shooter stood when a bullet hurt it", () => {
  expect(rememberShot(brain, {bulletDamage: 10, from: SHOOTER})?.shotFrom).toEqual(SHOOTER);
});

it("remembers the shot for any damage, however small", () => {
  expect(rememberShot(brain, {bulletDamage: 0.001, from: SHOOTER})?.shotFrom).toEqual(SHOOTER);
});

it("remembers nothing when no bullet hurt it", () => {
  expect(rememberShot(brain, {bulletDamage: 0, from: SHOOTER})?.shotFrom).toBeUndefined();
});

it("leaves an opponent with no brain with none", () => {
  expect(rememberShot(undefined, {bulletDamage: 10, from: SHOOTER})).toBeUndefined();
});

it("changes nothing else in the brain", () => {
  const shot = rememberShot(brain, {bulletDamage: 10, from: SHOOTER});

  expect({...shot, shotFrom: undefined}).toEqual({...brain, shotFrom: undefined});
});

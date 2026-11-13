import {aimErrorFor} from "@gunsmith/engine/opponent/aim/AimErrorFor";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";

it("misses by the widest error, scaled by the roll, when it has only just seen the player", () => {
  expect(aimErrorFor({seenSeconds: 0, roll: 1})).toBeCloseTo(DIFFICULTY.widestAimError, 9);
  expect(aimErrorFor({seenSeconds: 0, roll: -1})).toBeCloseTo(-DIFFICULTY.widestAimError, 9);
  expect(aimErrorFor({seenSeconds: 0, roll: 0.5})).toBeCloseTo(DIFFICULTY.widestAimError / 2, 9);
});

it("settles to the narrowest error once it has had the player in sight long enough", () => {
  expect(aimErrorFor({seenSeconds: DIFFICULTY.aimSettleSeconds, roll: 1})).toBeCloseTo(DIFFICULTY.narrowestAimError, 9);
  expect(aimErrorFor({seenSeconds: DIFFICULTY.aimSettleSeconds * 10, roll: 1})).toBeCloseTo(
    DIFFICULTY.narrowestAimError,
    9,
  );
});

it("settles steadily, halfway between at half the time", () => {
  const halfway = (DIFFICULTY.widestAimError + DIFFICULTY.narrowestAimError) / 2;

  expect(aimErrorFor({seenSeconds: DIFFICULTY.aimSettleSeconds / 2, roll: 1})).toBeCloseTo(halfway, 9);
});

it("does not miss at all on a roll of zero", () => {
  expect(aimErrorFor({seenSeconds: 0, roll: 0})).toBe(0);
});

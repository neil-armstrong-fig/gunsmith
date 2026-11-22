import {isFriendCode} from "@gunsmith/shared/online/friend-code/IsFriendCode";
import {makeFriendCode} from "@src/router/routes/rooms/friend-code/MakeFriendCode";

it("makes a code that has the shape of a friend code", () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    expect(isFriendCode(makeFriendCode())).toBe(true);
  }
});

it("does not make the same code twice in a row", () => {
  const codes = new Set(Array.from({length: 50}, () => makeFriendCode()));

  expect(codes.size).toBeGreaterThan(45);
});

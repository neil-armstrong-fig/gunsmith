import {isFriendCode} from "@src/rooms/IsFriendCode";

it("accepts six letters and digits from the alphabet", () => {
  expect(isFriendCode("ABC234")).toBe(true);
});

it("refuses the wrong length", () => {
  expect(isFriendCode("ABC23")).toBe(false);
  expect(isFriendCode("ABC2345")).toBe(false);
  expect(isFriendCode("")).toBe(false);
});

it("refuses characters that are not in the alphabet, such as the look-alikes", () => {
  expect(isFriendCode("ABC0OO")).toBe(false);
  expect(isFriendCode("abc234")).toBe(false);
  expect(isFriendCode("ABC23!")).toBe(false);
});

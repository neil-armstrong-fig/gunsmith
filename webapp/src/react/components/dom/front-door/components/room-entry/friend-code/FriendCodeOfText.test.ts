import {friendCodeOfText} from "@src/react/components/dom/front-door/components/room-entry/friend-code/FriendCodeOfText";

it("is a code of six letters and digits as typed", () => {
  expect(friendCodeOfText("ABC234")).toBe("ABC234");
});

it("reads lower case, spaces and a hyphen in the middle as the same code", () => {
  expect(friendCodeOfText("  abc234 ")).toBe("ABC234");
  expect(friendCodeOfText("abc-234")).toBe("ABC234");
});

it("is nothing for text that is not six characters of the alphabet", () => {
  expect(friendCodeOfText("")).toBeUndefined();
  expect(friendCodeOfText("hello there")).toBeUndefined();
  expect(friendCodeOfText("ABC23")).toBeUndefined();
  expect(friendCodeOfText("ABC2345")).toBeUndefined();
});

it("refuses the characters the server's codes never use, which are read wrongly aloud", () => {
  expect(friendCodeOfText("ABC0O1")).toBeUndefined();
  expect(friendCodeOfText("ABCI23")).toBeUndefined();
});

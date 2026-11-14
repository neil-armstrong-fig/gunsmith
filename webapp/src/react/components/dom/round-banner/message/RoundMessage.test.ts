import {roundMessage} from "@src/react/components/dom/round-banner/message/RoundMessage";

it("says the player won when the round was won", () => {
  expect(roundMessage("won", undefined)).toBe("You won");
});

it("says the player lost when the round was lost", () => {
  expect(roundMessage("lost", undefined)).toBe("You lost");
});

it("says the round, not the match, while the match goes on", () => {
  expect(roundMessage("won", "playing")).toBe("You won");
  expect(roundMessage("lost", "playing")).toBe("You lost");
});

it("says the match was won when the round that ended it was won", () => {
  expect(roundMessage("won", "won")).toBe("You won the match");
});

it("says the match was lost when the round that ended it was lost", () => {
  expect(roundMessage("lost", "lost")).toBe("You lost the match");
});

import {roundMessage} from "@src/react/components/dom/round-banner/message/RoundMessage";

it("says the player won when the round was won", () => {
  expect(roundMessage("won")).toBe("You won");
});

it("says the player lost when the round was lost", () => {
  expect(roundMessage("lost")).toBe("You lost");
});

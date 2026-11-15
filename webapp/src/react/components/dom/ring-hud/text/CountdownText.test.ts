import {countdownText} from "@src/react/components/dom/ring-hud/text/CountdownText";

it("counts down in minutes and seconds, with the seconds always two digits", () => {
  expect(countdownText(45)).toBe("Ring in 0:45");
  expect(countdownText(9)).toBe("Ring in 0:09");
  expect(countdownText(1)).toBe("Ring in 0:01");
});

it("rolls whole minutes over", () => {
  expect(countdownText(60)).toBe("Ring in 1:00");
  expect(countdownText(75)).toBe("Ring in 1:15");
});

it("says the ring is closing once the countdown is over", () => {
  expect(countdownText(0)).toBe("Ring closing");
});

import {mutedFromSearch} from "@src/game/sound/muted/MutedFromSearch";

it("is muted when the query asks for it", () => {
  expect(mutedFromSearch("?mute=1")).toBe(true);
});

it("finds the request among other parameters", () => {
  expect(mutedFromSearch("?scenario=duel&mute=1&seed=3")).toBe(true);
});

it("is not muted when the query does not ask", () => {
  expect(mutedFromSearch("")).toBe(false);
  expect(mutedFromSearch("?scenario=duel")).toBe(false);
});

it("is not muted for any other value", () => {
  expect(mutedFromSearch("?mute=0")).toBe(false);
  expect(mutedFromSearch("?mute=")).toBe(false);
  expect(mutedFromSearch("?mute=yes")).toBe(false);
});

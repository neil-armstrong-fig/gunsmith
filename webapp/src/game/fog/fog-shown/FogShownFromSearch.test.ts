import {fogShownFromSearch} from "@src/game/fog/fog-shown/FogShownFromSearch";

it("shows the fog when the page asks nothing of it", () => {
  expect(fogShownFromSearch("")).toBe(true);
});

it("hides the fog when the page asks for it off", () => {
  expect(fogShownFromSearch("?scenario=terrain&fog=off")).toBe(false);
});

it("shows the fog for anything else the page asks", () => {
  expect(fogShownFromSearch("?fog=on")).toBe(true);
  expect(fogShownFromSearch("?fog=")).toBe(true);
  expect(fogShownFromSearch("?fog=0")).toBe(true);
});

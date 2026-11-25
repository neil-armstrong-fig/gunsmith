import {parseArenaRotation} from "@src/durable-objects/match/arena-rotation/ParseArenaRotation";

it("uses the day's arenas when the page says nothing of them", () => {
  expect(parseArenaRotation(new URLSearchParams(""))).toBe(true);
  expect(parseArenaRotation(new URLSearchParams("room=ABCD&startSeed=21"))).toBe(true);
});

it("offers every arena when the page turns the rotation off", () => {
  expect(parseArenaRotation(new URLSearchParams("room=ABCD&arenaRotation=off"))).toBe(false);
});

it("uses the day's arenas for anything but exactly off", () => {
  for (const asked of ["", "on", "OFF", " off", "false", "0"]) {
    expect(parseArenaRotation(new URLSearchParams({arenaRotation: asked}))).toBe(true);
  }
});

const WIDTH = 40;
const HEIGHT = 30;

/**
 * What the fake tier's generator answers to a request for a huge or vast arena: a playable 40 by 30 hall, walled, with a ring of
 * pillars, written as drawing rows so it passes whichever way a real model is asked (the fake model always answers in rows). The
 * mapping's own copy, so a spec asking for size can tell a model that made a large arena from one that gave the small one.
 */
export const FAKE_LARGE_ARENA_REPLY = {
  name: "Vast Pillar Hall",
  rows: Array.from({length: HEIGHT}, (_, y) => Array.from({length: WIDTH}, (_, x) => tileAt(x, y)).join("")),
};

function tileAt(x: number, y: number): string {
  if (x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1) {
    return "#";
  }

  const pillar = x % 8 === 4 && y % 6 === 3;
  if (pillar) {
    return "#";
  }

  return ".";
}

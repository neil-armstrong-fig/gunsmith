import {sectorOf} from "@gunsmith/engine/sound/hearing/direction/SectorOf";

const FROM = {x: 10, y: 10};

it("puts a sound due north in sector 0, and the rest of the compass clockwise from it", () => {
  const dueTo = [
    {x: 10, y: 15},
    {x: 15, y: 15},
    {x: 15, y: 10},
    {x: 15, y: 5},
    {x: 10, y: 5},
    {x: 5, y: 5},
    {x: 5, y: 10},
    {x: 5, y: 15},
  ];

  expect(dueTo.map(to => sectorOf(FROM, to))).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
});

it("gives the same sector at any distance, so a sector says nothing of how far", () => {
  expect(sectorOf(FROM, {x: 11, y: 11})).toBe(sectorOf(FROM, {x: 30, y: 30}));
});

it("changes sector half way between two compass points, 22.5 degrees from north", () => {
  const justInside = {x: 10 + Math.tan(22.4 * (Math.PI / 180)), y: 11};
  const justOutside = {x: 10 + Math.tan(22.6 * (Math.PI / 180)), y: 11};

  expect(sectorOf(FROM, justInside)).toBe(0);
  expect(sectorOf(FROM, justOutside)).toBe(1);
});

it("keeps a sound a little west of north in sector 0, wrapping past the last sector", () => {
  expect(sectorOf(FROM, {x: 9.9, y: 12})).toBe(0);
  expect(sectorOf(FROM, {x: 8, y: 12.5})).toBe(7);
});

it("puts a sound from the very same place in sector 0, since it has no direction", () => {
  expect(sectorOf(FROM, FROM)).toBe(0);
});

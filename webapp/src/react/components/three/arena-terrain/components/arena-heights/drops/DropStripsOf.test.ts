import {dropStripsOf} from "@src/react/components/three/arena-terrain/components/arena-heights/drops/DropStripsOf";

it("puts the lip inside the raised tile along the edge it drops from, and the shadow outside it", () => {
  const {lip, shadow} = dropStripsOf("west");

  expect(lip.x).toBe(0);
  expect(lip.width).toBeGreaterThan(0);
  expect(lip.height).toBe(1);
  expect(shadow.x + shadow.width).toBeCloseTo(0, 9);
  expect(shadow.x).toBeLessThan(0);
  expect(shadow.height).toBe(1);
});

it("mirrors that on the east edge", () => {
  const {lip, shadow} = dropStripsOf("east");

  expect(lip.x + lip.width).toBeCloseTo(1, 9);
  expect(shadow.x).toBeCloseTo(1, 9);
  expect(shadow.width).toBeGreaterThan(0);
});

it("runs the lip and shadow along the whole edge on a north or south drop", () => {
  const north = dropStripsOf("north");
  const south = dropStripsOf("south");

  expect(north.lip).toMatchObject({y: 1 - north.lip.height, width: 1});
  expect(north.shadow).toMatchObject({y: 1, width: 1});
  expect(south.lip).toMatchObject({y: 0, width: 1});
  expect(south.shadow.y + south.shadow.height).toBeCloseTo(0, 9);
});

it("makes the shadow wider than the lip, so the drop reads from above", () => {
  for (const facing of ["north", "south", "east", "west"] as const) {
    const {lip, shadow} = dropStripsOf(facing);

    expect(shadow.width * shadow.height).toBeGreaterThan(lip.width * lip.height);
  }
});

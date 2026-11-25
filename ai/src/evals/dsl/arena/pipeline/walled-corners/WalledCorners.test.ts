import {walledCorners} from "@evals/dsl/arena/pipeline/walled-corners/WalledCorners";

it("finds no corner walled in a rectangle of open floor", () => {
  expect(walledCorners(openRectangle(20, 12))).toBe(0);
});

it("finds all four corners walled in a plus sign", () => {
  expect(walledCorners(plusSign())).toBe(4);
});

it("finds all four corners walled in a plus sign with thick arms, its corners only 3 tiles wide", () => {
  expect(walledCorners(thickPlusSign())).toBe(4);
});

it("finds one corner walled in an L, its wall block in one corner", () => {
  expect(walledCorners(lShape())).toBe(1);
});

it("reads each corner inside the border wall, so the border alone walls no corner, even in the smallest arena", () => {
  expect(walledCorners(openRectangle(8, 5))).toBe(0);
});

it("still counts a corner walled with a few stray floor tiles, nine tenths of it wall", () => {
  expect(walledCorners(largeArenaWithTopLeftWalledExcept(2))).toBe(1);
});

it("does not count a corner walled when more than a tenth of it is floor", () => {
  expect(walledCorners(largeArenaWithTopLeftWalledExcept(3))).toBe(0);
});

it("finds no corner in a drawing with no rows", () => {
  expect(walledCorners([])).toBe(0);
});

function plusSign(): string[] {
  return [
    "####################",
    "#######......#######",
    "#######......#######",
    "#######......#######",
    "#..................#",
    "#..................#",
    "#..................#",
    "#..................#",
    "#######......#######",
    "#######......#######",
    "#######......#######",
    "####################",
  ];
}

function thickPlusSign(): string[] {
  return [
    "####################",
    "####............####",
    "####............####",
    "#..................#",
    "#..................#",
    "#..................#",
    "#..................#",
    "#..................#",
    "#..................#",
    "####............####",
    "####............####",
    "####################",
  ];
}

function lShape(): string[] {
  return [
    "####################",
    "#.........##########",
    "#.........##########",
    "#.........##########",
    "#.........##########",
    "#.........##########",
    "#..................#",
    "#..................#",
    "#..................#",
    "#..................#",
    "#..................#",
    "####################",
  ];
}

// 40 by 30: the top-left corner block inside the border is 6 by 4, 24 tiles, so 2 floor tiles leave 22 walls (91.7%) and 3 leave 21 (87.5%).
function largeArenaWithTopLeftWalledExcept(floorTiles: number): string[] {
  const rows = openRectangle(40, 30);
  const blockTiles = Array.from({length: 24}, (_, index) => index >= floorTiles);

  return rows.map((row, y) => {
    if (y < 1 || y > 4) {
      return row;
    }

    const walls = blockTiles.slice((y - 1) * 6, y * 6).map(isWall => (isWall ? "#" : "."));

    return `#${walls.join("")}${row.slice(7)}`;
  });
}

function openRectangle(width: number, height: number): string[] {
  const wall = "#".repeat(width);
  const floor = `#${".".repeat(width - 2)}#`;

  return [wall, ...Array.from({length: height - 2}, () => floor), wall];
}

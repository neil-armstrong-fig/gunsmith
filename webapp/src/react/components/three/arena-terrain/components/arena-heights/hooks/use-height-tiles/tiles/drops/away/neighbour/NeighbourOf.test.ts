import {neighbourOf} from "@src/react/components/three/arena-terrain/components/arena-heights/hooks/use-height-tiles/tiles/drops/away/neighbour/NeighbourOf";

const TILE = {x: 4, y: 7};

it("is the tile to the west, east, south and north of the one given", () => {
  expect(neighbourOf(TILE, "west")).toEqual({x: 3, y: 7});
  expect(neighbourOf(TILE, "east")).toEqual({x: 5, y: 7});
  expect(neighbourOf(TILE, "south")).toEqual({x: 4, y: 6});
  expect(neighbourOf(TILE, "north")).toEqual({x: 4, y: 8});
});

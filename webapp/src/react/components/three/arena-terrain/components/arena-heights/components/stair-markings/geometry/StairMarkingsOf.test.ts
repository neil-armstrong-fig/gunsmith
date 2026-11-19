import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";
import {stairMarkingsOf} from "@src/react/components/three/arena-terrain/components/arena-heights/components/stair-markings/geometry/StairMarkingsOf";

it.each<Uphill>(["east", "west", "north", "south"])(
  "turns the treads and both landing rails when climbing %s",
  uphill => {
    const {treads, rails} = stairMarkingsOf(uphill);
    const treadCentres = treads.map(({x, y}) => [(x || 0) * 64, (y || 0) * 64]);
    const railCentres = rails.map(({x, y}) => [(x || 0) * 64, (y || 0) * 64]);
    const eastWest = uphill === "east" || uphill === "west";

    expect(treads.map(({width, height}) => [width * 64, height * 64])).toEqual(
      Array(3).fill(eastWest ? [2, 54] : [54, 2]),
    );
    expect(rails.map(({width, height}) => [width * 64, height * 64])).toEqual(
      Array(2).fill(eastWest ? [96, 2] : [2, 96]),
    );
    expect(treadCentres).toEqual(
      {
        east: [
          [-15, 0],
          [1, 0],
          [17, 0],
        ],
        west: [
          [15, 0],
          [-1, 0],
          [-17, 0],
        ],
        north: [
          [0, -15],
          [0, 1],
          [0, 17],
        ],
        south: [
          [0, 15],
          [0, -1],
          [0, -17],
        ],
      }[uphill],
    );
    expect(railCentres).toEqual(
      {
        east: [
          [0, -27],
          [0, 27],
        ],
        west: [
          [0, 27],
          [0, -27],
        ],
        north: [
          [27, 0],
          [-27, 0],
        ],
        south: [
          [-27, 0],
          [27, 0],
        ],
      }[uphill],
    );
  },
);

import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {shootFighter} from "@gunsmith/engine/game-loop/fighter/ShootFighter";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

// Low ground at x 1, a stair at x 2 up to level 1 at x 3, a stair at x 4 up to level 2 at x 5.
const terraces = arenaFrom(["#######", "#.>1>2#", "#######"]);

function turnAt(position: Point, fires: boolean): FighterTurn {
  const fighter = {...startingWorld(terraces).player, position, aim: {x: 1, y: 0}};

  return {fighter, fires};
}

it("lets no bullet go when the trigger did not fire", () => {
  const shot = shootFighter(terraces, "player", turnAt({x: 1.5, y: 1.5}, false));

  expect(shot.bullet).toBeUndefined();
});

it("marks the bullet with the shooter's side", () => {
  expect(shootFighter(terraces, "opponent", turnAt({x: 1.5, y: 1.5}, true)).bullet?.shooter).toBe("opponent");
});

it("fires a bullet at the level of the ground the shooter stands on", () => {
  expect(shootFighter(terraces, "player", turnAt({x: 1.5, y: 1.5}, true)).bullet?.level).toBe(0);
  expect(shootFighter(terraces, "player", turnAt({x: 3.5, y: 1.5}, true)).bullet?.level).toBe(1);
  expect(shootFighter(terraces, "player", turnAt({x: 5.5, y: 1.5}, true)).bullet?.level).toBe(2);
});

it("fires a bullet from a stair at the upper of the two levels it joins", () => {
  expect(shootFighter(terraces, "player", turnAt({x: 2.5, y: 1.5}, true)).bullet?.level).toBe(1);
});

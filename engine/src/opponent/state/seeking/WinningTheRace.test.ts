import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import {winningTheRace} from "@gunsmith/engine/opponent/state/seeking/WinningTheRace";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";

const hall = arenaFrom([
  "##########################",
  "#........................#",
  "#........................#",
  "#........................#",
  "##########################",
]);
const OPPONENT = {x: 2.5, y: 2.5};

describe("by the lead and the grace", () => {
  it("is winning when the opponent is nearer to the weapon than the player by more than the lead it asks for", () => {
    const weapon = {x: 6.5, y: 2.5};
    const player = {x: 6.5 + 4 + DIFFICULTY.seekLead + 0.5, y: 2.5};

    expect(winningTheRace(brainIn("wander"), contextOf({opponent: OPPONENT, player, weapon}))).toBe(true);
  });

  it("is not winning when its lead is less than the lead it asks for", () => {
    const weapon = {x: 6.5, y: 2.5};
    const player = {x: 6.5 + 4 + DIFFICULTY.seekLead - 0.5, y: 2.5};

    expect(winningTheRace(brainIn("wander"), contextOf({opponent: OPPONENT, player, weapon}))).toBe(false);
  });

  it("is not winning when the player is nearer to the weapon", () => {
    const weapon = {x: 20.5, y: 2.5};
    const player = {x: 18.5, y: 2.5};

    expect(winningTheRace(brainIn("wander"), contextOf({opponent: OPPONENT, player, weapon}))).toBe(false);
  });

  it("is not winning when no weapon lies in the arena", () => {
    expect(winningTheRace(brainIn("wander"), contextOf({opponent: OPPONENT, player: {x: 20.5, y: 2.5}}))).toBe(false);
  });

  it("is not winning when it cannot set out for the weapon, since a wall stands in the straight line and it walks with no map", () => {
    const walled = arenaFrom(["##########", "#...#....#", "#...#....#", "#...#....#", "##########"]);
    const request = {arena: walled, opponent: {x: 1.5, y: 2.5}, player: {x: 8.5, y: 2.5}, weapon: {x: 6.5, y: 2.5}};

    expect(winningTheRace(brainIn("wander"), contextOf(request))).toBe(false);
  });

  it("keeps seeking when it is behind by less than the grace it allows, which the lead it asked to set out does not allow", () => {
    const weapon = {x: 6.5, y: 2.5};
    const player = {x: 6.5 + 4 - DIFFICULTY.seekGrace + 0.5, y: 2.5};
    const request = {opponent: OPPONENT, player, weapon};

    expect(winningTheRace(brainIn("seek"), contextOf(request))).toBe(true);
    expect(winningTheRace(brainIn("wander"), contextOf(request))).toBe(false);
  });

  it("turns back when it is behind by more than the grace it allows, though it is seeking", () => {
    const weapon = {x: 6.5, y: 2.5};
    const player = {x: 6.5 + 4 - DIFFICULTY.seekGrace - 0.5, y: 2.5};

    expect(winningTheRace(brainIn("seek"), contextOf({opponent: OPPONENT, player, weapon}))).toBe(false);
  });
});

describe("round a drop", () => {
  // The platform is columns 1 to 6, the stair is column 7 in the top row only (y 3), the low ground is columns 8 to 12.
  const terraced = arenaFrom([
    "##############",
    "#111111<....##",
    "#111111.....##",
    "#111111.....##",
    "##############",
  ]);

  it("judges by the walk round a drop, not the straight line: across a drop from the weapon it is not winning though it is nearer as the crow flies", () => {
    const request = {
      arena: terraced,
      opponent: {x: 8.5, y: 1.5},
      player: {x: 1.5, y: 1.5},
      weapon: {x: 6.5, y: 1.5},
    };

    expect(
      Math.hypot(request.opponent.x - request.weapon.x, request.opponent.y - request.weapon.y) + DIFFICULTY.seekLead,
    ).toBeLessThan(Math.hypot(request.player.x - request.weapon.x, request.player.y - request.weapon.y));
    expect(winningTheRace(brainIn("wander"), contextOf(request))).toBe(false);
  });

  it("judges the player's walk round a drop too: a player just across it from the weapon is far, though near as the crow flies", () => {
    const request = {
      arena: terraced,
      opponent: {x: 4.5, y: 1.5},
      player: {x: 7.5, y: 1.5},
      weapon: {x: 6.5, y: 1.5},
    };

    expect(Math.hypot(request.player.x - request.weapon.x, request.player.y - request.weapon.y)).toBeLessThan(
      Math.hypot(request.opponent.x - request.weapon.x, request.opponent.y - request.weapon.y),
    );
    expect(winningTheRace(brainIn("wander"), contextOf(request))).toBe(true);
  });

  it("takes a player whose walk it cannot measure as being as near as the straight line, so it does not race a lead it cannot prove", () => {
    const walled = arenaFrom(["##########", "#........#", "#..#.....#", "#........#", "##########"]);
    const request = {arena: walled, opponent: {x: 6.5, y: 1.5}, player: {x: 1.5, y: 2.5}, weapon: {x: 4.5, y: 2.5}};

    expect(winningTheRace(brainIn("wander"), contextOf(request))).toBe(false);
  });
});

describe("while the ring closes", () => {
  // Reaches 10 tiles from the centre until it starts at 10 s, then closes to 2 tiles by 30 s: 6 tiles at 20 s, 4 inside the margin.
  const closingRing: Ring = {
    roundSeconds: 20,
    centre: {x: 13, y: 2.5},
    startRadius: 10,
    timing: {startDelaySeconds: 10, closingSeconds: 20},
  };

  it("is not winning when the weapon lies outside the closing ring's safe ground, since it could never stand there to take it", () => {
    const request = {opponent: OPPONENT, player: {x: 24.5, y: 2.5}, weapon: {x: 6.5, y: 2.5}, ring: closingRing};

    expect(winningTheRace(brainIn("wander"), contextOf(request))).toBe(false);
    expect(winningTheRace(brainIn("seek"), contextOf(request))).toBe(false);
  });

  it("is not winning when the weapon lies within the ring's edge but inside the margin it keeps from it", () => {
    const nearTheEdge = {x: closingRing.centre.x - 5, y: 2.5};
    const request = {opponent: OPPONENT, player: {x: 24.5, y: 2.5}, weapon: nearTheEdge, ring: closingRing};

    expect(winningTheRace(brainIn("wander"), contextOf(request))).toBe(false);
  });

  it("is winning when the weapon lies inside the closing ring's safe ground, as far as the margin allows", () => {
    const inside = {x: closingRing.centre.x - 4 + 0.5, y: 2.5};
    const request = {opponent: OPPONENT, player: {x: 24.5, y: 2.5}, weapon: inside, ring: closingRing};

    expect(winningTheRace(brainIn("wander"), contextOf(request))).toBe(true);
  });

  it("is winning for a weapon far out while the ring has not started to close, since the whole arena is safe", () => {
    const request = {
      opponent: OPPONENT,
      player: {x: 24.5, y: 2.5},
      weapon: {x: 6.5, y: 2.5},
      ring: {...closingRing, roundSeconds: 5},
    };

    expect(winningTheRace(brainIn("wander"), contextOf(request))).toBe(true);
  });
});

interface Positions {
  arena?: Arena;
  opponent: Point;
  player: Point;
  weapon?: Point;
  ring?: Ring;
}

function contextOf(positions: Positions): OpponentContext {
  const arena = positions.arena ?? hall;
  const world = startingWorld(arena, [], positions.opponent);
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }
  const pickup = positions.weapon && {position: positions.weapon, weapon: SUBMACHINE_GUN};

  return {
    arena,
    opponent: world.opponent,
    target: {...world.player, position: positions.player},
    sees: true,
    seconds: 1 / 60,
    pickup,
    ring: positions.ring,
  };
}

function brainIn(state: OpponentBrain["state"]): OpponentBrain {
  return {...startingBrain({seed: 1, position: OPPONENT}), state};
}

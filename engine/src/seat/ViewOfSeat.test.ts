import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {viewOfSeat} from "@gunsmith/engine/seat/ViewOfSeat";

// The first seat starts at (12.5, 3.5) facing east and the second 4 tiles east of it facing west, on one clear row.
const room = arenaFrom([
  "########################",
  ...Array(5).fill("#" + ".".repeat(22) + "#"),
  "########################",
]);

describe("a seat's own fighter", () => {
  it("is told in full", () => {
    const world = duel();

    expect(viewOfSeat(world, "first").player).toEqual(world.player);
    expect(viewOfSeat(world, "second").player).toEqual(world.opponent);
  });
});

describe("the other fighter", () => {
  const walled = arenaFrom([
    "########################",
    ...Array(5).fill("#" + ".".repeat(14) + "#" + ".".repeat(7) + "#"),
    "########################",
  ]);

  it("is told to a seat that sees them", () => {
    const world = duel();

    expect(viewOfSeat(world, "first").opponent).toEqual(world.opponent);
    expect(viewOfSeat(world, "second").opponent).toEqual(world.player);
  });

  it("is left out when the seat has its back to them", () => {
    const world = duel();
    const turnedAway: World = {...world, player: {...world.player, aim: {x: -1, y: 0}}};

    expect(viewOfSeat(turnedAway, "first").opponent).toBeUndefined();
    expect("opponent" in JSON.parse(JSON.stringify(viewOfSeat(turnedAway, "first")))).toBe(false);
    expect(viewOfSeat(turnedAway, "second").opponent).toEqual(turnedAway.player);
  });

  it("is left out when a wall is in the way", () => {
    const world = startingWorld(walled, [], {x: 20.5, y: 3.5});

    expect(viewOfSeat(world, "first").opponent).toBeUndefined();
    expect(viewOfSeat(world, "second").opponent).toBeUndefined();
  });
});

describe("with the second seat's fighter right behind a cover block", () => {
  // The same room with a cover block at (16, 3), so the second seat's fighter, at (17.5, 3.5), stands right behind it.
  const coverRow = "#" + ".".repeat(15) + "c" + ".".repeat(6) + "#";
  const openRow = "#" + ".".repeat(22) + "#";
  const withCover = arenaFrom([
    "########################",
    openRow,
    openRow,
    coverRow,
    openRow,
    openRow,
    "########################",
  ]);
  let world: World;

  beforeEach(() => {
    world = startingWorld(withCover, [], {x: 17.5, y: 3.5});
  });

  it("tells the first seat about the fighter when they stand, since it sees over the block", () => {
    expect(viewOfSeat(world, "first").opponent).toEqual(world.opponent);
  });

  it("leaves the fighter out of the first seat's view when they crouch, in what is sent as well", () => {
    const hiding: World = {...world, opponent: world.opponent && {...world.opponent, crouching: true}};

    expect(viewOfSeat(hiding, "first").opponent).toBeUndefined();
    expect("opponent" in JSON.parse(JSON.stringify(viewOfSeat(hiding, "first")))).toBe(false);
    expect(JSON.stringify(viewOfSeat(hiding, "first"))).not.toContain("17.5");
  });

  it("leaves the other fighter out of a crouching seat's view, though the other stands", () => {
    const crouching: World = {...world, opponent: world.opponent && {...world.opponent, crouching: true}};

    expect(viewOfSeat(crouching, "second").opponent).toBeUndefined();
    expect(viewOfSeat({...world, player: {...world.player, crouching: true}}, "first").opponent).toBeUndefined();
  });
});

describe("bullets", () => {
  it("are told to a seat on its own side, and on the other side only where it sees", () => {
    const world: World = {...duel(), bullets: [shot("player", 13.5), shot("opponent", 14.5), shot("opponent", 2.5)]};

    expect(viewOfSeat(world, "first").bullets.map(bullet => bullet.position.x)).toEqual([13.5, 14.5]);
    expect(viewOfSeat(world, "second").bullets.map(bullet => bullet.position.x)).toEqual([13.5, 14.5, 2.5]);
  });
});

describe("the round", () => {
  it("is told to a seat from its own side", () => {
    const won: World = {...duel(), round: "won", match: {playerWins: 1, opponentWins: 0, roundNumber: 1}};

    expect(viewOfSeat(won, "first").round).toBe("won");
    expect(viewOfSeat(won, "second").round).toBe("lost");
    expect(viewOfSeat(won, "second").match).toEqual({playerWins: 0, opponentWins: 1, roundNumber: 1});
  });
});

describe("what a seat is never told", () => {
  it("is the brain, the events or the dummies: sent as JSON, only what it may know is there", () => {
    const withSecrets = giveOpponentBrain(
      {...duel(), dummies: [{position: {x: 3.5, y: 3.5}, health: 5}], events: [{kind: "fireRefused", reason: "empty"}]},
      7,
    );
    const sent = JSON.parse(JSON.stringify(viewOfSeat(withSecrets, "first"))) as object;

    expect(Object.keys(sent).sort()).toEqual(["bullets", "elapsedSeconds", "opponent", "player", "round"]);
  });

  it("is where a shot that hurt the opponent came from, which its brain remembers", () => {
    const brained = giveOpponentBrain(duel(), 7);
    const remembering = {
      ...brained,
      opponentBrain: brained.opponentBrain && {...brained.opponentBrain, shotFrom: {x: 88.125, y: 77.375}},
    };

    for (const seat of ["first", "second"] as const) {
      const sent = JSON.stringify(viewOfSeat(remembering, seat));

      expect(sent).not.toContain("shotFrom");
      expect(sent).not.toContain("88.125");
      expect(sent).not.toContain("77.375");
    }
  });

  it("is where a shot was fired from: a seen bullet carries its flight and the shooter's stance, and no place of origin", () => {
    const world: World = {...duel(), bullets: [{...shot("opponent", 14.5), crouching: true}]};

    for (const seat of ["first", "second"] as const) {
      const [sent] = JSON.parse(JSON.stringify(viewOfSeat(world, seat).bullets)) as object[];

      expect(Object.keys(sent ?? {}).sort()).toEqual([
        "crouching",
        "damage",
        "direction",
        "level",
        "position",
        "shooter",
        "speed",
      ]);
    }
  });
});

function shot(shooter: Bullet["shooter"], x: number): Bullet {
  return {position: {x, y: 3.5}, direction: {x: 1, y: 0}, damage: 1, speed: 1, shooter, level: 0, crouching: false};
}

function duel(): World {
  return startingWorld(room, [], {x: 12.5 + 4, y: 3.5});
}

import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {visibleToPlayer} from "@gunsmith/engine/vision/VisibleToPlayer";

// The player starts at (12.5, 3.5), facing east.
const room = arenaFrom([
  "########################",
  ...Array(5).fill("#" + ".".repeat(22) + "#"),
  "########################",
]);

describe("on one level", () => {
  it("shows an opponent in front of the player", () => {
    const world = startingWorld(room, [], {x: 12.5 + 4, y: 3.5});

    expect(visibleToPlayer(world).opponent).toBe(true);
  });

  it("hides an opponent behind the player", () => {
    const world = startingWorld(room, [], {x: 12.5 - 4, y: 3.5});

    expect(visibleToPlayer(world).opponent).toBe(false);
  });

  it("hides an opponent beyond the weapon's range", () => {
    const world = startingWorld(room, [], {x: 12.5 + RIFLE.visionRange + 0.5, y: 3.5});

    expect(visibleToPlayer(world).opponent).toBe(false);
  });

  it("hides an opponent behind a wall", () => {
    const walled = arenaFrom([
      "########################",
      ...Array(5).fill("#" + ".".repeat(14) + "#" + ".".repeat(7) + "#"),
      "########################",
    ]);
    const world = startingWorld(walled, [], {x: 20.5, y: 3.5});

    expect(visibleToPlayer(world).opponent).toBe(false);
  });

  it("says no when there is no opponent", () => {
    expect(visibleToPlayer(startingWorld(room)).opponent).toBe(false);
  });

  it("says which dummies the player sees, in the order they stand", () => {
    const world: World = startingWorld(room, [
      {x: 12.5 + 3, y: 3.5},
      {x: 12.5 - 3, y: 3.5},
      {x: 12.5 + 5, y: 3.5},
    ]);

    expect(visibleToPlayer(world).dummies).toEqual([true, false, true]);
  });

  it("shows the player's own bullets wherever they are", () => {
    const world: World = {
      ...startingWorld(room),
      bullets: [
        {
          position: {x: 12.5 - 5, y: 3.5},
          direction: {x: -1, y: 0},
          damage: 25,
          speed: 20,
          shooter: "player",
          level: 0,
          crouching: false,
        },
      ],
    };

    expect(visibleToPlayer(world).bullets).toEqual([true]);
  });

  it("shows the opponent's bullets only where the player sees", () => {
    const bullet = (x: number): Bullet => ({
      position: {x, y: 3.5},
      direction: {x: -1, y: 0},
      damage: 25,
      speed: 20,
      shooter: "opponent",
      level: 0,
      crouching: false,
    });
    const world: World = {...startingWorld(room), bullets: [bullet(12.5 + 4), bullet(12.5 - 4), bullet(12.5 + 20)]};

    expect(visibleToPlayer(world).bullets).toEqual([true, false, false]);
  });
});

describe("across levels", () => {
  // The player starts on the low ground at (12.5, 2.5) facing east, with a platform one level up from x = 15 to x = 20 and low ground again beyond it.
  const platformAhead = arenaFrom([
    "########################",
    "#..............111111..#",
    "#..............111111..#",
    "#..............111111..#",
    "########################",
  ]);
  const ON_THE_PLATFORM = {x: 17.5, y: 2.5};

  it("hides an opponent on a platform from a player on the low ground, though it is in front of them and in range", () => {
    const world = startingWorld(platformAhead, [], ON_THE_PLATFORM);

    expect(visibleToPlayer(world).opponent).toBe(false);
  });

  it("hides a dummy on a platform from a player on the low ground", () => {
    const world = startingWorld(platformAhead, [ON_THE_PLATFORM]);

    expect(visibleToPlayer(world).dummies).toEqual([false]);
  });

  it("hides the opponent's bullet on a platform from a player on the low ground", () => {
    const bullet: Bullet = {
      position: ON_THE_PLATFORM,
      direction: {x: -1, y: 0},
      damage: 25,
      speed: 20,
      shooter: "opponent",
      level: 0,
      crouching: false,
    };
    const world = {...startingWorld(platformAhead), bullets: [bullet]};

    expect(visibleToPlayer(world).bullets).toEqual([false]);
  });

  it("shows an opponent on the low ground to a player who has climbed up to the platform", () => {
    const world = startingWorld(platformAhead, [], {x: 22.5, y: 2.5});
    const onThePlatform = {...world, player: {...world.player, position: ON_THE_PLATFORM}};

    expect(visibleToPlayer(onThePlatform).opponent).toBe(true);
  });
});

describe("behind a cover block", () => {
  // The player starts at (12.5, 3.5) facing east, with a cover block at (16, 3): a fighter at (17.5, 3.5) is right behind it.
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
  const BEHIND_THE_COVER = {x: 17.5, y: 3.5};

  it("shows a standing opponent behind a cover block, which a standing player sees over", () => {
    expect(visibleToPlayer(startingWorld(withCover, [], BEHIND_THE_COVER)).opponent).toBe(true);
  });

  it("hides a crouching opponent behind a cover block", () => {
    const world = startingWorld(withCover, [], BEHIND_THE_COVER);
    const opponent = world.opponent;
    if (!opponent) {
      throw new Error("The world has no opponent.");
    }

    expect(visibleToPlayer({...world, opponent: {...opponent, crouching: true}}).opponent).toBe(false);
  });

  it("shows a crouching opponent in the open", () => {
    const world = startingWorld(withCover, [], {x: 20.5, y: 3.5});
    const opponent = world.opponent;
    if (!opponent) {
      throw new Error("The world has no opponent.");
    }

    expect(visibleToPlayer({...world, opponent: {...opponent, crouching: true}}).opponent).toBe(true);
  });

  it("hides a standing opponent behind a cover block from a crouching player", () => {
    const world = startingWorld(withCover, [], BEHIND_THE_COVER);

    expect(visibleToPlayer({...world, player: {...world.player, crouching: true}}).opponent).toBe(false);
  });

  it("hides a crouching dummy behind a cover block, and shows a standing one and a crouching one in the open", () => {
    const world = startingWorld(withCover, [BEHIND_THE_COVER, BEHIND_THE_COVER, {x: 20.5, y: 3.5}]);
    const crouched = world.dummies.map((dummy, index) => ({...dummy, crouching: index !== 1}));

    expect(visibleToPlayer({...world, dummies: crouched}).dummies).toEqual([false, true, true]);
  });
});

describe("of a pickup", () => {
  it("shows a pickup in front of the player and hides one behind them", () => {
    const world = startingWorld(room, [], {x: 20.5, y: 3.5});

    expect(visibleToPlayer({...world, pickup: {position: {x: 15.5, y: 3.5}, weapon: RIFLE}}).pickup).toBe(true);
    expect(visibleToPlayer({...world, pickup: {position: {x: 9.5, y: 3.5}, weapon: RIFLE}}).pickup).toBe(false);
  });

  it("hides a pickup beyond the weapon's range or behind a wall, and has none to show when none lies there", () => {
    const world = startingWorld(room, [], {x: 20.5, y: 3.5});
    const walled = arenaFrom([
      "########################",
      "#...........#..........#",
      "#...........#..........#",
      "#...........#..........#",
      "########################",
    ]);

    expect(
      visibleToPlayer({...world, pickup: {position: {x: 12.5 + RIFLE.visionRange + 0.5, y: 3.5}, weapon: RIFLE}})
        .pickup,
    ).toBe(false);
    expect(
      visibleToPlayer({...startingWorld(walled), pickup: {position: {x: 16.5, y: 2.5}, weapon: RIFLE}}).pickup,
    ).toBe(false);
    expect(visibleToPlayer(world).pickup).toBe(false);
  });
});

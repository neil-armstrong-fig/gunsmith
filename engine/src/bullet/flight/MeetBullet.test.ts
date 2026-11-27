import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {meetBullet} from "@gunsmith/engine/bullet/flight/MeetBullet";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {FlightRequest} from "@gunsmith/engine/bullet/types/FlightRequest";

describe("on open floor with a pillar", () => {
  // Floor is x 1 to 5 and y 1 to 3, with a one-tile pillar at x 3, y 2.
  const hall = arenaFrom(["#######", "#.....#", "#..#..#", "#.....#", "#######"]);

  it("meets nothing in open floor within reach", () => {
    expect(meetBullet(hall, request({seconds: 0.01}), bulletAt(1.5)).contact).toBe("none");
  });

  it("meets a wall", () => {
    expect(meetBullet(hall, request({}), bulletAt(2.5)).contact).toBe("wall");
  });

  it("meets a dummy in its path, and says which one", () => {
    const dummies = [
      {position: {x: 4.5, y: 3.5}, health: 100},
      {position: {x: 3.5, y: 1.5}, health: 100},
    ];
    const meeting = meetBullet(hall, request({dummies}), bulletAt(1.5));

    expect(meeting.contact).toBe("dummy");
    expect(meeting.dummyIndex).toBe(1);
  });

  it("gives no dummy to a bullet that met something else", () => {
    const meeting = meetBullet(hall, request({}), bulletAt(2.5));

    expect(meeting.dummyIndex).toBeUndefined();
  });

  it("meets the opponent for a player's bullet", () => {
    const meeting = meetBullet(hall, request({opponentPosition: {x: 3.5, y: 1.5}}), bulletAt(1.5));

    expect(meeting.contact).toBe("fighter");
  });

  it("lets a player's bullet pass the player's own position", () => {
    const meeting = meetBullet(hall, request({playerPosition: {x: 3.5, y: 1.5}, seconds: 0.01}), bulletAt(1.5));

    expect(meeting.contact).toBe("none");
  });

  it("meets the player for an opponent's bullet", () => {
    const meeting = meetBullet(hall, request({playerPosition: {x: 3.5, y: 1.5}}), bulletAt(1.5, {shooter: "opponent"}));

    expect(meeting.contact).toBe("fighter");
  });

  it("lets an opponent's bullet pass dummies", () => {
    const dummies = [{position: {x: 3.5, y: 1.5}, health: 100}];
    const meeting = meetBullet(hall, request({dummies, seconds: 0.1}), bulletAt(1.5, {shooter: "opponent"}));

    expect(meeting.contact).toBe("none");
  });

  it("hands back the bullet it was given", () => {
    const bullet = bulletAt(1.5);

    expect(meetBullet(hall, request({}), bullet).bullet).toBe(bullet);
  });
});

describe("across levels", () => {
  // Low ground at x 1, a stair at x 2 up to a platform at x 3 and 4 (level 1), then low ground again at x 5, 6 and 7 past a drop.
  const platform = arenaFrom(["#########", "#.>11...#", "#########"]);
  const BEHIND_THE_PLATFORM_FACE = {position: {x: 3.5, y: 1.5}, health: 100};
  const LOW_GROUND_DUMMY = {position: {x: 6.5, y: 1.5}, health: 100};

  it("lets a low-ground bullet reach a dummy standing just past the face of a platform", () => {
    const meeting = meetBullet(
      platform,
      request({dummies: [BEHIND_THE_PLATFORM_FACE], seconds: 0.2}),
      bulletAt(1.5, {position: {x: 1.2, y: 1.5}, level: 0}),
    );

    expect(meeting.contact).toBe("dummy");
  });

  it("lets a bullet fired from the platform fly out over the drop and hit a dummy on the low ground", () => {
    const meeting = meetBullet(
      platform,
      request({dummies: [LOW_GROUND_DUMMY], seconds: 0.2}),
      bulletAt(1.5, {position: {x: 4.2, y: 1.5}, level: 1}),
    );

    expect(meeting.contact).toBe("dummy");
    expect(meeting.dummyIndex).toBe(0);
  });

  it("lets a bullet on the platform's level hit a dummy on the platform", () => {
    const meeting = meetBullet(
      platform,
      request({dummies: [BEHIND_THE_PLATFORM_FACE], seconds: 0.2}),
      bulletAt(1.5, {position: {x: 4.2, y: 1.5}, level: 1, direction: {x: -1, y: 0}}),
    );

    expect(meeting.contact).toBe("dummy");
  });

  it("still stops a bullet fired from the platform at the wall beyond the drop", () => {
    const meeting = meetBullet(
      platform,
      request({seconds: 0.5}),
      bulletAt(1.5, {position: {x: 4.2, y: 1.5}, level: 1}),
    );

    expect(meeting.contact).toBe("wall");
  });
});

describe("past a platform's edge", () => {
  // Low ground at x 1 to 3, a platform one level up at x 4 to 7 (its faces at x = 4 and x = 8), and low ground at x 8 to 10.
  const wide = arenaFrom(["############", "#...1111...#", "############"]);
  const AT_THE_EDGE = {position: {x: 4.5, y: 1.5}, health: 100};
  const BACK_FROM_THE_EDGE = {position: {x: 5.5, y: 1.5}, health: 100};
  const ON_THE_LOW_GROUND = {position: {x: 2.5, y: 1.5}, health: 100};
  const FROM_THE_LOW_GROUND = bulletAt(1.5, {position: {x: 2.2, y: 1.5}, level: 0, floor: 0});
  const WEST = {x: -1, y: 0};

  it("lets a low-ground bullet hit a dummy standing at the edge of the platform", () => {
    const meeting = meetBullet(wide, request({dummies: [AT_THE_EDGE], seconds: 0.2}), FROM_THE_LOW_GROUND);

    expect(meeting.contact).toBe("dummy");
  });

  it("lets a low-ground bullet hit an opponent standing at the edge of the platform", () => {
    const meeting = meetBullet(
      wide,
      request({opponentPosition: AT_THE_EDGE.position, seconds: 0.2}),
      FROM_THE_LOW_GROUND,
    );

    expect(meeting.contact).toBe("fighter");
  });

  it("stops a low-ground bullet a little way onto the platform, before a dummy standing back from the edge", () => {
    const meeting = meetBullet(wide, request({dummies: [BACK_FROM_THE_EDGE], seconds: 0.2}), FROM_THE_LOW_GROUND);

    expect(meeting.contact).toBe("wall");
    expect(meeting.dummyIndex).toBeUndefined();
  });

  it("stops a low-ground bullet no farther onto the platform than a body's width short of a tile", () => {
    expect(meetBullet(wide, request({seconds: 0.11}), FROM_THE_LOW_GROUND).contact).toBe("none");
    expect(meetBullet(wide, request({seconds: 0.13}), FROM_THE_LOW_GROUND).contact).toBe("wall");
  });

  it("passes a bullet fired from back on the platform over a dummy on the low ground", () => {
    const fromBack = bulletAt(1.5, {position: {x: 6.2, y: 1.5}, direction: WEST, level: 1, floor: 1});

    expect(meetBullet(wide, request({dummies: [ON_THE_LOW_GROUND], seconds: 0.2}), fromBack).contact).toBe("none");
  });

  it("passes an opponent's bullet fired from back on the platform over the player on the low ground", () => {
    const fromBack = bulletAt(1.5, {
      position: {x: 6.2, y: 1.5},
      direction: WEST,
      level: 1,
      floor: 1,
      shooter: "opponent",
    });

    expect(
      meetBullet(wide, request({playerPosition: ON_THE_LOW_GROUND.position, seconds: 0.2}), fromBack).contact,
    ).toBe("none");
  });

  it("lets a bullet fired from the platform's edge hit a dummy on the low ground", () => {
    const fromTheEdge = bulletAt(1.5, {position: {x: 4.2, y: 1.5}, direction: WEST, level: 1, floor: 0});

    expect(meetBullet(wide, request({dummies: [ON_THE_LOW_GROUND], seconds: 0.2}), fromTheEdge).contact).toBe("dummy");
  });

  it("lets a bullet fired from back on the platform hit a dummy on the platform", () => {
    const fromBack = bulletAt(1.5, {position: {x: 7.2, y: 1.5}, direction: WEST, level: 1, floor: 1});

    expect(meetBullet(wide, request({dummies: [BACK_FROM_THE_EDGE], seconds: 0.2}), fromBack).contact).toBe("dummy");
  });
});

describe("past a low cover block", () => {
  // The same platform, with a cover block on the low ground at x 6.
  const highGroundWithCover = arenaFrom(["#########", "#.>11.c.#", "#########"]);
  // Low ground with a cover block at x 3, and a target 1.5 tiles behind it (x 4.5), within the cover's reach.
  const covered = arenaFrom(["###########", "#..c......#", "###########"]);
  const BEHIND_THE_BLOCK = {x: 4.5, y: 1.5};
  const IN_THE_OPEN = {x: 8.5, y: 1.5};

  it("stops a crouched shooter's bullet at a cover block, before a dummy standing behind it", () => {
    const dummies = [{position: BEHIND_THE_BLOCK, health: 100}];
    const meeting = meetBullet(covered, request({dummies, seconds: 0.2}), bulletAt(1.5, {crouching: true}));

    expect(meeting.contact).toBe("wall");
    expect(meeting.dummyIndex).toBeUndefined();
  });

  it("lets a standing shooter's bullet fly over a cover block and hit a dummy standing behind it", () => {
    const dummies = [{position: BEHIND_THE_BLOCK, health: 100}];
    const meeting = meetBullet(covered, request({dummies, seconds: 0.2}), bulletAt(1.5));

    expect(meeting.contact).toBe("dummy");
    expect(meeting.dummyIndex).toBe(0);
  });

  it("lets a crouched shooter's bullet reach a dummy in the open as it would a standing one's", () => {
    const dummies = [{position: IN_THE_OPEN, health: 100}];
    const meeting = meetBullet(
      covered,
      request({dummies, seconds: 0.5}),
      bulletAt(1.5, {position: {x: 4.2, y: 1.5}, crouching: true}),
    );

    expect(meeting.contact).toBe("dummy");
  });

  it("lets a crouched shooter on higher ground fire over a cover block below them", () => {
    const dummies = [{position: {x: 7.5, y: 1.5}, health: 100}];
    const meeting = meetBullet(
      highGroundWithCover,
      request({dummies, seconds: 0.5}),
      bulletAt(1.5, {position: {x: 4.2, y: 1.5}, level: 1, crouching: true}),
    );

    expect(meeting.contact).toBe("dummy");
  });

  it("still stops a crouched shooter's bullet at a cover block on their own level", () => {
    const dummies = [{position: {x: 7.5, y: 1.5}, health: 100}];
    const meeting = meetBullet(
      highGroundWithCover,
      request({dummies, seconds: 0.5}),
      bulletAt(1.5, {position: {x: 5.2, y: 1.5}, crouching: true}),
    );

    expect(meeting.contact).toBe("wall");
  });

  it("passes over a crouched dummy with a cover block right beside it, and hits the next dummy beyond", () => {
    const dummies = [
      {position: BEHIND_THE_BLOCK, health: 100, crouching: true},
      {position: IN_THE_OPEN, health: 100, crouching: false},
    ];
    const meeting = meetBullet(covered, request({dummies, seconds: 0.5}), bulletAt(1.5));

    expect(meeting.contact).toBe("dummy");
    expect(meeting.dummyIndex).toBe(1);
  });

  it("hits a standing dummy behind cover and a crouched dummy in the open", () => {
    const standing = [{position: BEHIND_THE_BLOCK, health: 100, crouching: false}];
    const crouchedInTheOpen = [{position: IN_THE_OPEN, health: 100, crouching: true}];

    expect(meetBullet(covered, request({dummies: standing, seconds: 0.5}), bulletAt(1.5)).contact).toBe("dummy");
    expect(meetBullet(covered, request({dummies: crouchedInTheOpen, seconds: 0.5}), bulletAt(1.5)).contact).toBe(
      "dummy",
    );
  });

  it("passes over a crouched opponent with a cover block right beside them", () => {
    const meeting = meetBullet(
      covered,
      request({opponentPosition: BEHIND_THE_BLOCK, opponentCrouching: true, seconds: 0.2}),
      bulletAt(1.5),
    );

    expect(meeting.contact).toBe("none");
  });

  it("hits an opponent who stands behind cover, or crouches in the open", () => {
    const standing = request({opponentPosition: BEHIND_THE_BLOCK, opponentCrouching: false, seconds: 0.2});
    const crouchedInTheOpen = request({opponentPosition: IN_THE_OPEN, opponentCrouching: true, seconds: 0.5});

    expect(meetBullet(covered, standing, bulletAt(1.5)).contact).toBe("fighter");
    expect(meetBullet(covered, crouchedInTheOpen, bulletAt(1.5)).contact).toBe("fighter");
  });

  it("treats an opponent with no stance given as standing", () => {
    expect(
      meetBullet(covered, request({opponentPosition: BEHIND_THE_BLOCK, seconds: 0.2}), bulletAt(1.5)).contact,
    ).toBe("fighter");
  });

  it("passes an opponent's bullet over a crouched player with a cover block right beside them, and hits one who stands", () => {
    const bullet = bulletAt(1.5, {shooter: "opponent"});

    expect(
      meetBullet(covered, request({playerPosition: BEHIND_THE_BLOCK, playerCrouching: true, seconds: 0.2}), bullet)
        .contact,
    ).toBe("none");
    expect(
      meetBullet(covered, request({playerPosition: BEHIND_THE_BLOCK, playerCrouching: false, seconds: 0.2}), bullet)
        .contact,
    ).toBe("fighter");
  });
});

function bulletAt(y: number, changes: Partial<Bullet> = {}): Bullet {
  return {
    position: {x: 1.5, y},
    direction: {x: 1, y: 0},
    damage: 25,
    speed: 20,
    shooter: "player",
    level: 0,
    crouching: false,
    floor: 0,
    ...changes,
  };
}

function request(changes: Partial<FlightRequest>): FlightRequest {
  return {bullets: [], dummies: [], seconds: 0.1, ...changes};
}

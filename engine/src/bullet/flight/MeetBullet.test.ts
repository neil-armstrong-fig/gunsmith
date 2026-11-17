import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {meetBullet} from "@gunsmith/engine/bullet/flight/MeetBullet";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {FlightRequest} from "@gunsmith/engine/bullet/types/FlightRequest";

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

// Low ground at x 1, a stair at x 2 up to a platform at x 3 and 4 (level 1), then low ground again at x 5, 6 and 7 past a drop.
const platform = arenaFrom(["#########", "#.>11...#", "#########"]);
const BEHIND_THE_PLATFORM_FACE = {position: {x: 3.5, y: 1.5}, health: 100};
const LOW_GROUND_DUMMY = {position: {x: 6.5, y: 1.5}, health: 100};

it("stops a low-ground bullet at the face of a platform, before a dummy standing on it", () => {
  const meeting = meetBullet(
    platform,
    request({dummies: [BEHIND_THE_PLATFORM_FACE], seconds: 0.2}),
    bulletAt(1.5, {position: {x: 1.2, y: 1.5}, level: 0}),
  );

  expect(meeting.contact).toBe("wall");
  expect(meeting.dummyIndex).toBeUndefined();
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
  const meeting = meetBullet(platform, request({seconds: 0.5}), bulletAt(1.5, {position: {x: 4.2, y: 1.5}, level: 1}));

  expect(meeting.contact).toBe("wall");
});

function bulletAt(y: number, changes: Partial<Bullet> = {}): Bullet {
  return {
    position: {x: 1.5, y},
    direction: {x: 1, y: 0},
    damage: 25,
    speed: 20,
    shooter: "player",
    level: 0,
    ...changes,
  };
}

function request(changes: Partial<FlightRequest>): FlightRequest {
  return {bullets: [], dummies: [], seconds: 0.1, ...changes};
}

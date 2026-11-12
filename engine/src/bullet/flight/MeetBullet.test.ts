import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {meetBullet} from "@gunsmith/engine/bullet/flight/MeetBullet";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {FlightRequest} from "@gunsmith/engine/bullet/types/FlightRequest";

// Floor is x 1 to 5 and y 1 to 3, with a one-tile pillar at x 3, y 2.
const hall = arenaFrom(["#######", "#.....#", "#..#..#", "#.....#", "#######"]);

function bulletAt(y: number, changes: Partial<Bullet> = {}): Bullet {
  return {position: {x: 1.5, y}, direction: {x: 1, y: 0}, damage: 25, speed: 20, shooter: "player", ...changes};
}

function request(changes: Partial<FlightRequest>): FlightRequest {
  return {bullets: [], dummies: [], seconds: 0.1, ...changes};
}

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

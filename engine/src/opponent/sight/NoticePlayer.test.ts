import {noticePlayer} from "@gunsmith/engine/opponent/sight/NoticePlayer";
import {startingBrain} from "@gunsmith/engine/opponent/StartingBrain";

const TICK = 1 / 60;
const PLAYER = {x: 8.5, y: 3.5};
const brain = {...startingBrain({seed: 1, position: {x: 0, y: 0}}), seenSeconds: 1, lastSeen: {x: 2.5, y: 2.5}};

it("remembers where the player is, and how long it has had them in sight, when it sees them", () => {
  const noticed = noticePlayer(brain, {sees: true, target: PLAYER, seconds: TICK});

  expect(noticed.lastSeen).toEqual(PLAYER);
  expect(noticed.seenSeconds).toBeCloseTo(1 + TICK, 9);
});

it("forgets how long it has had the player in sight, but not where they were, when it loses them", () => {
  const noticed = noticePlayer(brain, {sees: false, target: PLAYER, seconds: TICK});

  expect(noticed.lastSeen).toEqual({x: 2.5, y: 2.5});
  expect(noticed.seenSeconds).toBe(0);
});

it("changes nothing else", () => {
  const noticed = noticePlayer(brain, {sees: true, target: PLAYER, seconds: TICK});

  expect(noticed.state).toBe(brain.state);
  expect(noticed.seed).toBe(brain.seed);
  expect(noticed.secondsInState).toBe(brain.secondsInState);
});

it("has no last-seen place until it has seen the player", () => {
  const fresh = startingBrain({seed: 1, position: {x: 0, y: 0}});

  expect(noticePlayer(fresh, {sees: false, target: PLAYER, seconds: TICK}).lastSeen).toBeUndefined();
});

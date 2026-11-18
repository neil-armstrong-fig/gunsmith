import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import {noticeShot} from "@gunsmith/engine/opponent/sight/NoticeShot";

const SHOOTER = {x: 12.5, y: 3.5};
const SEEN_AT = {x: 2.5, y: 2.5};
const brain = {...startingBrain({seed: 1, position: {x: 3.5, y: 3.5}}), lastSeen: SEEN_AT, seenSeconds: 0};

it("takes the place a shot came from as the last place it knew the player to be, when it cannot see them", () => {
  expect(noticeShot({...brain, shotFrom: SHOOTER}, {sees: false}).lastSeen).toEqual(SHOOTER);
});

it("takes it even when it had never seen the player", () => {
  const never = {...brain, lastSeen: undefined, shotFrom: SHOOTER};

  expect(noticeShot(never, {sees: false}).lastSeen).toEqual(SHOOTER);
});

it("leaves the player's place alone when it sees them, since sight is truer than the shot", () => {
  expect(noticeShot({...brain, shotFrom: SHOOTER}, {sees: true}).lastSeen).toEqual(SEEN_AT);
});

it("leaves everything alone when no shot hurt it", () => {
  expect(noticeShot(brain, {sees: false})).toEqual(brain);
});

it("keeps the shot in the brain for the state choice to read", () => {
  expect(noticeShot({...brain, shotFrom: SHOOTER}, {sees: false}).shotFrom).toEqual(SHOOTER);
});

import {ClickLatch} from "@src/sound/empty-click/ClickLatch";
import type {ClickRequest} from "@src/sound/empty-click/types/ClickRequest";

const REFUSED: ClickRequest = {refused: true, firing: true, round: "playing"};

it("clicks when a held trigger is refused", () => {
  expect(new ClickLatch().shouldClick(REFUSED)).toBe(true);
});

it("does not click when nothing was refused", () => {
  expect(new ClickLatch().shouldClick({...REFUSED, refused: false})).toBe(false);
});

it("clicks once for a hold, however many steps refuse it", () => {
  const latch = new ClickLatch();

  expect(latch.shouldClick(REFUSED)).toBe(true);
  expect(latch.shouldClick(REFUSED)).toBe(false);
  expect(latch.shouldClick(REFUSED)).toBe(false);
});

it("clicks again after the trigger is let go and pulled again", () => {
  const latch = new ClickLatch();
  latch.shouldClick(REFUSED);

  latch.shouldClick({...REFUSED, refused: false, firing: false});

  expect(latch.shouldClick(REFUSED)).toBe(true);
});

it("does not click again when a refusal comes back while the same hold goes on, as after a reload that ran dry", () => {
  const latch = new ClickLatch();
  latch.shouldClick(REFUSED);

  latch.shouldClick({...REFUSED, refused: false});

  expect(latch.shouldClick(REFUSED)).toBe(false);
});

it("does not click for a round that is not being played", () => {
  expect(new ClickLatch().shouldClick({...REFUSED, round: "lost"})).toBe(false);
});

it("wants a fresh press after a round was not being played, even if the trigger stayed held", () => {
  const latch = new ClickLatch();
  latch.shouldClick({...REFUSED, round: "lost"});

  expect(latch.shouldClick(REFUSED)).toBe(false);

  latch.shouldClick({...REFUSED, refused: false, firing: false});

  expect(latch.shouldClick(REFUSED)).toBe(true);
});

it("wants a fresh press after it is told to cancel", () => {
  const latch = new ClickLatch();
  latch.cancel();

  expect(latch.shouldClick(REFUSED)).toBe(false);
});

import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const WINDOW_SIZES = [
  {width: 1280, height: 720},
  {width: 1920, height: 1080},
  {width: 900, height: 900},
];

given("the game has opened", () => {
  when.each(
    WINDOW_SIZES,
    size => `the window is ${size.width} by ${size.height}`,
    size => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.resizeWindowTo(size);
      });

      then("the arena fills the whole window", async ({gunsmith}) => {
        expect(await gunsmith.arena.getSizeOnScreen()).toEqual(gunsmith.getWindowSize());
      });
    },
  );
});

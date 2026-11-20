import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const SHOT = "sfx-shot";

given("the player is on the practice range", () => {
  when("they hold fire until the magazine runs dry", () => {
    let capacity = 0;

    beforeEach(async ({gunsmith}) => {
      capacity = (await gunsmith.weapon.get()).rounds;
      await gunsmith.player.switchTo(1);
      await gunsmith.waitForGameSeconds(0.2);
      await gunsmith.player.startFiring();
      await gunsmith.weapon.waitForRounds(0);
      await expect.poll(() => gunsmith.sound.getPlays("sfx-empty-click")).toHaveLength(1);
      await gunsmith.player.stopFiring();
    });

    then("each spent round is heard once and an empty trigger adds no shot", async ({gunsmith}) => {
      const shots = await gunsmith.sound.getPlays(SHOT);
      expect(shots).toHaveLength(capacity);
      expect(shots.every(shot => shot.contextState === "running" && !shot.looping)).toBe(true);
    });
  });
});

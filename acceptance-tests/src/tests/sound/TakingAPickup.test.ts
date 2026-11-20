import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const PICKUP_SOUND = "sfx-pickup";

given("seed-8 sparring with a pickup on the player's row", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparringWithSeed(8);
  });

  when("the player walks over the pickup", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.walkFor("east", 0.7);
      await gunsmith.pickup.waitUntilTaken();
    });

    then("the submachine gun is in hand, in the slot that was held, and the latch plays once", async ({gunsmith}) => {
      await expect
        .poll(() => gunsmith.hud.getInventory())
        .toMatchObject({
          selectedName: "Submachine gun",
          firstSelected: true,
        });
      await expect.poll(async () => (await gunsmith.sound.getPlays(PICKUP_SOUND)).length).toBe(1);
      await expect
        .poll(async () => await gunsmith.sound.getPlays(PICKUP_SOUND))
        .toEqual([
          expect.objectContaining({
            url: expect.stringMatching(/\/sfx-pickup[^/]*\.mp3$/),
            contextState: "running",
            looping: false,
            ended: true,
          }),
        ]);
    });
  });

  when("the player switches to slot 2 with the pickup still lying in the arena", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.switchTo(2);
      await gunsmith.hud.waitForSlot(2);
      await gunsmith.waitForGameSeconds(0.5);
    });

    then("there is no pickup sound", async ({gunsmith}) => {
      expect(await gunsmith.pickup.get()).toBeDefined();
      expect(await gunsmith.hud.getInventory()).toMatchObject({selectedName: "Marksman rifle"});
      expect(await gunsmith.sound.getPlays(PICKUP_SOUND)).toHaveLength(0);
    });
  });

  when("the player collects the pickup while muted and then unmutes", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.sound.toggleMute();
      await gunsmith.player.walkFor("east", 0.7);
      await gunsmith.pickup.waitUntilTaken();
      await gunsmith.sound.toggleMute();
      await gunsmith.waitForGameSeconds(0.5);
    });

    then("the inventory is updated and the latch has stayed silent", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.hud.getInventory()).toMatchObject({selectedName: "Submachine gun"});
      expect(await gunsmith.sound.getPlays(PICKUP_SOUND)).toHaveLength(0);
    });
  });
});

given("a pickup race with the weapon nearer the opponent", () => {
  when("the opponent collects it", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.startPickupRace(2);
      await gunsmith.player.switchTo(1);
      await gunsmith.pickup.waitUntilTaken(15);
    });

    then("the opponent gets its larger magazine and the local pickup cue stays silent", async ({gunsmith}) => {
      expect((await gunsmith.opponent.get()).rounds).toBeGreaterThan(12);
      expect(await gunsmith.sound.getPlays(PICKUP_SOUND)).toHaveLength(0);
    });
  });
});

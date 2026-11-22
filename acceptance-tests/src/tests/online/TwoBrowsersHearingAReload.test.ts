import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const RELOAD = "sfx-reload";
const RELOAD_STARTED = {kind: "reloadStarted"};

given("two browsers are in a private room and the first browser is watched for sounds", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
  });

  when("the first player fires and asks to reload twice", () => {
    beforeEach(async ({gunsmith}) => {
      const {rounds} = await gunsmith.weapon.get();
      await gunsmith.player.fire();
      await gunsmith.weapon.waitForRounds(rounds - 1);
      await gunsmith.player.reload();
      await gunsmith.weapon.waitForReloadToStart();
      await gunsmith.player.reload();
      await gunsmith.weapon.waitForReloadToEnd();
    });

    then("they hear one reload and only their seat is told it started", async ({gunsmith}) => {
      expect(await gunsmith.sound.getPlays(RELOAD)).toMatchObject([{contextState: "running", looping: false}]);
      expect(gunsmith.room.getEventsReceived().filter(event => isReloadStarted(event))).toEqual([RELOAD_STARTED]);
      expect(gunsmith.room.secondBrowser().room.getEventsReceived()).not.toContainEqual(RELOAD_STARTED);
    });
  });

  when("the first player asks to reload a full magazine and the second player reloads after firing", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.reload();
      const second = gunsmith.room.secondBrowser();
      await second.sound.startWatching();
      await second.reloadThePage();
      await second.waitForGameSeconds(0.1);
      const {rounds} = await second.weapon.get();
      await second.player.fire();
      await second.weapon.waitForRounds(rounds - 1);
      await second.player.reload();
      await second.weapon.waitForReloadToStart();
      await second.weapon.waitForReloadToEnd();
    });

    then("only the second player is told their reload started and the first hears no reload", async ({gunsmith}) => {
      expect(
        gunsmith.room
          .secondBrowser()
          .room.getEventsReceived()
          .filter(event => isReloadStarted(event)),
      ).toEqual([RELOAD_STARTED]);
      expect(gunsmith.room.getEventsReceived()).not.toContainEqual(RELOAD_STARTED);
      expect(await gunsmith.sound.getPlays(RELOAD)).toEqual([]);
    });
  });

  when("the first player reloads while muted and unmutes after the reload", () => {
    beforeEach(async ({gunsmith}) => {
      const {rounds} = await gunsmith.weapon.get();
      await gunsmith.sound.toggleMute();
      await gunsmith.player.fire();
      await gunsmith.weapon.waitForRounds(rounds - 1);
      await gunsmith.player.reload();
      await gunsmith.weapon.waitForReloadToStart();
      await gunsmith.weapon.waitForReloadToEnd();
      await gunsmith.sound.toggleMute();
      await gunsmith.waitForGameSeconds(0.1);
    });

    then("no reload cue plays even though the reload started", async ({gunsmith}) => {
      expect(gunsmith.room.getEventsReceived()).toContainEqual(RELOAD_STARTED);
      expect(await gunsmith.sound.getPlays(RELOAD)).toEqual([]);
    });
  });
});

function isReloadStarted(event: unknown): boolean {
  return typeof event === "object" && event !== null && Reflect.get(event, "kind") === RELOAD_STARTED.kind;
}

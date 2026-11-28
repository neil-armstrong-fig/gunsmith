import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Hold the observing browser, leaving the room and its other browser running. Once the room has sent the hit, show a few frames and sample the canvas.
const SHOW_HIT_SECONDS = 0.04;
const VISIBLE_HIT = {kind: "hitLanded", on: "opponent"};
const HEALTH_TRAIL = "health-trail";

given("two players in a private room, with the first browser held on a frame", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom();
    await gunsmith.room.joinWithASecondBrowser(code);
    await gunsmith.clock.holdTheGame();
  });

  when("the second player lands a bullet on the first", () => {
    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await second.player.aimAtTile(await gunsmith.player.getPosition());
      await second.player.fire();
      await expect
        .poll(() => gunsmith.room.frames.getEventsReceived())
        .toContainEqual({
          kind: "damageTaken",
          cause: "bullet",
          amount: expect.any(Number),
        });

      await gunsmith.clock.runGameFor(SHOW_HIT_SECONDS);
    });

    then("the receiver sees both damage brackets", async ({gunsmith}) => {
      const damage = await gunsmith.player.getDamageOnScreen();
      expect(damage.leftBracketPoints).toBeGreaterThan(0);
      expect(damage.rightBracketPoints).toBeGreaterThan(0);
    });

    then("the receiver's camera shakes", async ({gunsmith}) => {
      const {x, y} = await gunsmith.camera.getShake();
      expect(Math.hypot(x, y)).toBeGreaterThan(0.1);
    });

    then("the receiver's lost health trails behind the bar", async ({gunsmith}) => {
      await expect
        .poll(() => gunsmith.hud.getMotions(HEALTH_TRAIL))
        .toMatchObject([{kind: "transition", durationSeconds: 0.35}]);
    });
  });

  when("the first player lands a bullet on the visible opponent", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(await gunsmith.room.secondBrowser().player.getPosition());
      await gunsmith.player.fire();
      await gunsmith.clock.runGameFor(SHOW_HIT_SECONDS);

      await expect.poll(() => gunsmith.room.frames.getEventsReceived()).toContainEqual(VISIBLE_HIT);
      await gunsmith.clock.runGameFor(SHOW_HIT_SECONDS);
    });

    then("four mint ticks appear around the opponent", async ({gunsmith}) => {
      expect((await gunsmith.opponent.getHitOnScreen()).cornersWithTicks).toBe(4);
      expect((await gunsmith.player.getHitOnScreen()).cornersWithTicks).toBe(0);
    });

    when("the first player turns away while the hit ticks are still live", () => {
      beforeEach(async ({gunsmith}) => {
        expect((await gunsmith.opponent.getHitOnScreen()).cornersWithTicks).toBe(4);
        await gunsmith.player.aimAwayFrom(await gunsmith.room.secondBrowser().player.getPosition());
        await gunsmith.clock.runGameFor(SHOW_HIT_SECONDS);
      });

      then("the ticks disappear from the place the opponent was visible", async ({gunsmith}) => {
        const place = await gunsmith.room.secondBrowser().player.getPosition();
        expect((await gunsmith.dummies.getHitOnScreen(place)).cornersWithTicks).toBe(0);
      });
    });
  });
});

given("the first browser prefers reduced motion in a private room", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.browser.preferReducedMotion();
    const code = await gunsmith.room.createPrivateRoom();
    await gunsmith.room.joinWithASecondBrowser(code);

    await gunsmith.clock.holdTheGame();
  });

  when("the second player hits the first", () => {
    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await second.player.aimAtTile(await gunsmith.player.getPosition());
      await second.player.fire();
      await expect
        .poll(() => gunsmith.room.frames.getEventsReceived())
        .toContainEqual({
          kind: "damageTaken",
          cause: "bullet",
          amount: expect.any(Number),
        });

      await gunsmith.clock.runGameFor(SHOW_HIT_SECONDS);
    });

    then("brackets show the hit with no shake or health trail animation", async ({gunsmith}) => {
      expect((await gunsmith.player.getDamageOnScreen()).leftBracketPoints).toBeGreaterThan(0);
      expect(await gunsmith.camera.getShake()).toEqual({x: 0, y: 0});
      expect(await gunsmith.hud.getMotions(HEALTH_TRAIL)).toEqual([]);
    });
  });
});

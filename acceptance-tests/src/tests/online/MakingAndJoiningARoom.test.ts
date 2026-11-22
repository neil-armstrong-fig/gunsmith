import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A player reaches a private room from the practice range: one makes a room and is given its friend code, the other types the code in.
// The room's own limits are shown on the practice page's address (the room entry passes the page's own query on), so a room made here
// begins its match as the second player sits, as every other online spec expects.
given("the practice range, as a first-time player finds it", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.entry.openThePracticeRange();
  });

  then("making a room and joining one are offered", async ({gunsmith}) => {
    expect(await gunsmith.room.entry.hasMakeARoom()).toBe(true);
    expect(await gunsmith.room.entry.hasJoinARoom()).toBe(true);
  });

  when("the player types the game's own keys into the friend code box", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.entry.typeTheCode("2wasd");
      await gunsmith.menu.pressEscape();
      await gunsmith.menu.resumePlay();
      await gunsmith.waitForGameSeconds(0.1);
    });

    then("the game does not see them: the weapon in hand is still the first", async ({gunsmith}) => {
      expect((await gunsmith.weapon.get()).slot).toBe(1);
    });
  });

  when("the player makes a room", () => {
    let code = "";

    beforeEach(async ({gunsmith}) => {
      code = await gunsmith.room.entry.makeARoom();
    });

    then("they are in a room with a friend code of six letters and digits", async ({gunsmith}) => {
      expect(code).toMatch(/^[A-Z2-9]{6}$/);
      expect(await gunsmith.room.entry.getFriendCode()).toBe(code);
    });

    when("a second player types that code in at their own practice range", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.room.openASecondBrowserOnThePracticeRange();
        await gunsmith.room.secondBrowser().room.entry.joinARoom(code);
      });

      then("both browsers are in the same room and both are sent the match", async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        await gunsmith.room.waitForTheMatch();
        await second.room.waitForTheMatch();

        expect(await second.room.entry.getFriendCode()).toBe(code);
        expect(await second.menu.isOpen()).toBe(false);
      });
    });
  });

  when("the player types something that is not a friend code and joins", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.entry.joinARoom("hello there");
    });

    then("they are told it is not a friend code and stay on the practice range", async ({gunsmith}) => {
      expect(await gunsmith.room.entry.getMessage()).toBe("That is not a friend code: it is six letters and digits.");
      expect(await gunsmith.room.entry.getFriendCode()).toBeUndefined();
    });
  });

  when("the server cannot make a room", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.entry.turnAwayNewRooms();
      await gunsmith.room.entry.tryToMakeARoom();
    });

    then("they are told so and stay on the practice range", async ({gunsmith}) => {
      expect(await gunsmith.room.entry.getMessage()).toBe("A room could not be made. Try again.");
      expect(await gunsmith.room.entry.getFriendCode()).toBeUndefined();
    });
  });
});

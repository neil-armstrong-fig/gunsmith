import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a player is on the practice range", () => {
  when("they open References & credits", () => {
    let roundsBefore = 0;

    beforeEach(async ({gunsmith}) => {
      roundsBefore = (await gunsmith.weapon.get()).rounds;
      await gunsmith.references.open();
    });

    then("the Foley guide is credited in a new tab and the weapon has not fired", async ({gunsmith}) => {
      expect(await gunsmith.references.getFoleySource()).toBe(
        "https://www.gameaudiolearning.com/knowledgebase/how-to-record-foley-for-games",
      );
      expect((await gunsmith.weapon.get()).rounds).toBe(roundsBefore);
    });
  });
});

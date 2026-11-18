import type {Coming} from "@src/match/property-tests/match-room/arbitraries/types/Coming";
import {makeComingHappen} from "@src/match/property-tests/match-room/score-checks/coming/MakeComingHappen";
import {expectKeptOrRestarted} from "@src/match/property-tests/match-room/score-checks/score-rules/ExpectKeptOrRestarted";
import {expectLegal} from "@src/match/property-tests/match-room/score-checks/score-rules/ExpectLegal";
import type {SeatedPeople} from "@src/match/property-tests/match-room/score-checks/types/SeatedPeople";
import {startedRoom} from "@src/match/property-tests/match-room/started-room/StartedRoom";

/** Whoever leaves, returns, asks or waits through `plan`, the score is legal after each coming, and is restarted only as a fresh match. */
export function expectTheScoreToStayLegal(plan: Coming[]): void {
  const room = startedRoom();
  const people: SeatedPeople = {
    room,
    tokens: {first: room.joinedMessage("first").token, second: room.joinedMessage("second").token},
  };
  let before = room.snapshotFor("first")?.match;
  let asks = 0;

  for (const coming of plan) {
    asks += 1;
    makeComingHappen(people, coming, asks);

    const match = room.snapshotFor("first")?.match;
    if (!match || !before) {
      throw new Error("A room that has begun has a match");
    }

    expectLegal(match);
    expectKeptOrRestarted(before, match);
    before = match;
  }
}

import {saveItem} from "@src/shared/accounts/save-item/SaveItem";
import {savedItemsOfAccount} from "@src/shared/accounts/saved-items-of-account/SavedItemsOfAccount";
import {testAccounts} from "@src/shared/accounts/testing/in-memory/TestAccounts";
import {SHELF_LIMITS} from "@src/router/routes/library/limits/ShelfLimits";
import {isArenaPipelineAvailable} from "@src/router/routes/arenas/pipeline/IsArenaPipelineAvailable";
import {runArenaPipeline} from "@src/router/routes/arenas/pipeline/RunArenaPipeline";
import type {MockedFunction} from "vitest";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";
import type {CreditAccount} from "@src/durable-objects/credit-ledger/account/CreditAccount";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {ARENA_SPEND} from "@src/durable-objects/spend-ledger/estimate/arena/ArenaSpend";
import {settledArenaSpend} from "@src/durable-objects/spend-ledger/estimate/arena/SettledArenaSpend";
import {SPEND_CAPS} from "@src/durable-objects/spend-ledger/meter/SpendCaps";
import type {SpendReservation} from "@src/durable-objects/spend-ledger/types/SpendReservation";
import {PIPELINE_TIME_LIMIT_MILLISECONDS} from "@src/router/routes/shared/time-limit/PipelineTimeLimit";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import {generateArenaRoute} from "@src/router/routes/arenas/GenerateArenaRoute";
import {cookieOfPlayer} from "@src/router/routes/shared/fake-accounts/CookieOfPlayer";

it("takes a credit and answers the arena when one is created", async () => {
  const ledgers = fakeLedgers();
  smithThatAnswers(created);
  const response = await generateArenaRoute(post({prompt: "a foggy canyon"}));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({id: expect.any(String), status: "created", arena: {name: "Canyon"}});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 1);
});

it("keeps the created arena under the id it answers, off the shelf until it is saved by that id", async () => {
  fakeLedgers();
  smithThatAnswers(created);
  const answer = (await (await generateArenaRoute(post({prompt: "a foggy canyon"}))).json()) as {id: string};

  expect(await savedItemsOfAccount("acct-1")).toEqual([]);
  expect(await saveItem({id: answer.id, userId: "acct-1", now: new Date(), limits: SHELF_LIMITS})).toEqual({
    status: "saved",
  });
  expect(await savedItemsOfAccount("acct-1")).toEqual([
    expect.objectContaining({
      id: answer.id,
      kind: "arena",
      prompt: "a foggy canyon",
      payload: {arena: {name: "Canyon"}},
    }),
  ]);
});

it("gives each created arena an id of its own", async () => {
  fakeLedgers();
  smithThatAnswers(created);
  const first = (await (await generateArenaRoute(post({prompt: "one"}))).json()) as {id: string};
  const second = (await (await generateArenaRoute(post({prompt: "two"}))).json()) as {id: string};

  expect(second.id).not.toBe(first.id);
});

it("keeps nothing and answers no id when the outcome is not a created arena", async () => {
  const keeping = vi.spyOn(testAccounts, "keepGeneratedItem");

  for (const outcome of [rejected, invalid]) {
    fakeLedgers();
    smithThatAnswers(outcome);
    const answer = await (await generateArenaRoute(post({prompt: "anything"}))).json();

    expect(answer).not.toHaveProperty("id");
  }
  expect(keeping).not.toHaveBeenCalled();
});

it("gives the credit back, once, and answers 502 when the created arena cannot be kept, still settling the spend of its calls", async () => {
  const ledgers = fakeLedgers();
  smithThatAnswers(created);
  vi.spyOn(testAccounts, "keepGeneratedItem").mockRejectedValue(new Error("the database is down"));

  const response = await generateArenaRoute(post({prompt: "a foggy canyon"}));

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({error: "generation-failed"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls.filter(call => call === "refund")).toHaveLength(1);
  expect(ledgers.calls).not.toContain("settle:arena");
  expect(ledgers.spendMeter.spentThisMonth()).toBe(settledArenaSpend(created));
});

it("takes half a credit and says why when the prompt is rejected", async () => {
  const ledgers = fakeLedgers();
  smithThatAnswers(rejected);
  const response = await generateArenaRoute(post({prompt: "a recipe for soup"}));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "rejected", reason: "that is not an arena"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 0.5);
});

it("takes half a credit, not the whole of it and not none, and answers the reason with no arena when the arena could not be made", async () => {
  const ledgers = fakeLedgers();
  smithThatAnswers(invalid);
  const response = await generateArenaRoute(post({prompt: "a maze"}));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "invalid", reason: "no playable arena"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 0.5);
  expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "spend:settle", "settle:unusable"]);
});

it("gives the credit back when the prompt was turned away before any model call, the one request that cost nothing", async () => {
  const ledgers = fakeLedgers();
  smithThatAnswers(turnedAwayBeforeTheModel);
  const response = await generateArenaRoute(post({prompt: "x".repeat(2000)}));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "rejected", reason: "that is too long"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "spend:settle", "refund"]);
  expect(ledgers.spendMeter.spentThisMonth()).toBe(0);
});

it("gives the credit back, once, and answers 502 when the pipeline throws", async () => {
  const ledgers = fakeLedgers();
  smithThatThrows();
  const response = await generateArenaRoute(post({prompt: "a maze"}));

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({error: "generation-failed"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls.filter(call => call === "refund")).toHaveLength(1);
});

it("answers 504 on timeout, refunds the credit and settles the full spend reservation", async () => {
  await withFakeTimers(async () => {
    const ledgers = fakeLedgers();
    const waiting = smithThatWaits();
    const answer = generateArenaRoute(post({prompt: "a maze"}));

    await waiting.started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS);
    const response = await answer;

    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({error: "generation-timed-out"});
    expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
    expect(ledgers.spendMeter.spentThisMonth()).toBe(ARENA_SPEND.reservedMicrodollars);
    expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
    expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "spend:settle", "refund"]);
  });
});

it("hands the pipeline a signal that stays open while it is within its time limit", async () => {
  await withFakeTimers(async () => {
    fakeLedgers();
    const waiting = smithThatWaits();
    const answer = generateArenaRoute(post({prompt: "a maze"}));

    await waiting.started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS - 1);

    expect(waiting.signalGiven()?.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await answer;
  });
});

it("aborts the pipeline's signal when the time limit is up, so the model call is told to stop", async () => {
  await withFakeTimers(async () => {
    fakeLedgers();
    const waiting = smithThatWaits();
    const answer = generateArenaRoute(post({prompt: "a maze"}));

    await waiting.started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS);
    await answer;

    expect(waiting.signalGiven()?.aborted).toBe(true);
  });
});

it("does not answer before the time limit is up", async () => {
  await withFakeTimers(async () => {
    fakeLedgers();
    const waiting = smithThatWaits();
    let answered = false;
    const answer = generateArenaRoute(post({prompt: "a maze"})).then(response => {
      answered = true;

      return response;
    });

    await waiting.started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS - 1);

    expect(answered).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await answer;
  });
});

it("settles nothing more when the pipeline answers after the route gave up", async () => {
  await withFakeTimers(async () => {
    const ledgers = fakeLedgers();
    const waiting = smithThatWaits();
    const answer = generateArenaRoute(post({prompt: "a maze"}));

    await waiting.started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS);
    await answer;
    waiting.answer(created);
    await vi.advanceTimersByTimeAsync(0);

    expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "spend:settle", "refund"]);
    expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  });
});

it("leaves no timer running once the pipeline has answered", async () => {
  await withFakeTimers(async () => {
    fakeLedgers();

    smithThatAnswers(created);
    await generateArenaRoute(post({prompt: "a maze"}));

    expect(vi.getTimerCount()).toBe(0);
  });
});

it("asks whether AI is on, then takes the credit, then reserves the spend, and settles both after the pipeline has run", async () => {
  const ledgers = fakeLedgers();

  smithThatAnswers(created);
  await generateArenaRoute(post({prompt: "a maze"}));

  expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "spend:settle", "settle:arena"]);
});

it("settles a rejected prompt at the rejected price", async () => {
  const ledgers = fakeLedgers();

  smithThatAnswers(rejected);
  await generateArenaRoute(post({prompt: "soup"}));

  expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "spend:settle", "settle:rejected"]);
});

it("holds the whole reservation against the spend while the pipeline runs", async () => {
  const ledgers = fakeLedgers();
  let heldDuringTheRun = 0;
  vi.mocked(runArenaPipeline).mockImplementation(async () => {
    heldDuringTheRun = ledgers.spendMeter.spentThisMonth();

    return created;
  });

  await generateArenaRoute(post({prompt: "a maze"}));

  expect(heldDuringTheRun).toBe(ARENA_SPEND.reservedMicrodollars);
});

it("settles the spend at the model calls the request made, whatever it came to", async () => {
  for (const outcome of [created, createdAfterRepair, rejected, invalid]) {
    const ledgers = fakeLedgers();

    smithThatAnswers(outcome);
    await generateArenaRoute(post({prompt: "a maze"}));

    expect(ledgers.spendMeter.spentThisMonth()).toBe(settledArenaSpend(outcome));
    expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
  }
});

it("settles the spend at the tokens the models reported, priced at Haiku's rates, when the pipeline reports them", async () => {
  const ledgers = fakeLedgers();

  smithThatAnswers({...createdAfterRepair, usage: {inputTokens: 3_500, outputTokens: 500}});
  await generateArenaRoute(post({prompt: "a maze"}));

  expect(ledgers.spendMeter.spentThisMonth()).toBe(600);
  expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
});

it("keeps the spend of an invalid request, since the model was billed, and the half credit with it", async () => {
  const ledgers = fakeLedgers();

  smithThatAnswers(invalid);
  await generateArenaRoute(post({prompt: "a maze"}));

  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 0.5);
  expect(ledgers.spendMeter.spentThisMonth()).toBe(settledArenaSpend(invalid));
});

it("keeps the whole reservation as spent when the pipeline throws, since its calls may have been billed", async () => {
  const ledgers = fakeLedgers();

  smithThatThrows();
  await generateArenaRoute(post({prompt: "a maze"}));

  expect(ledgers.spendMeter.spentThisMonth()).toBe(ARENA_SPEND.reservedMicrodollars);
  expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
  expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "spend:settle", "refund"]);
});

it("runs nothing, gives the credit back and says when AI returns when the reservation would cross a spend cap", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  ledgers.spendMeter.reserve(
    "earlier",
    SPEND_CAPS.dailyMicrodollars - ARENA_SPEND.reservedMicrodollars + 1,
    Date.now(),
  );

  const response = await generateArenaRoute(post({prompt: "a maze"}));

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-off", returnsAt: expect.any(Number)});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "refund", "status"]);
});

it("lets exactly as many requests through as fit under the cap when they arrive together, and refunds the rest", async () => {
  const ledgers = fakeLedgers();
  const gate = openableGate();
  const smith = vi.mocked(runArenaPipeline).mockImplementation(async () => {
    await gate.opened;

    return created;
  });
  const earlierSpend = SPEND_CAPS.dailyMicrodollars - 2 * ARENA_SPEND.reservedMicrodollars;
  ledgers.spendMeter.reserve("earlier", earlierSpend, Date.now());
  ledgers.spendMeter.settle("earlier", earlierSpend, Date.now());
  const accounts = ["acct-1", "acct-2", "acct-3", "acct-4", "acct-5"];
  const turnedAway: Response[] = [];

  const answers = accounts.map(async accountId => {
    const response = await generateArenaRoute(post({prompt: "a maze"}, accountId));
    if (response.status === 503) {
      turnedAway.push(response);
    }

    return response;
  });
  // Two requests hold the room that is left under the cap and the other three are turned away. Only then may the pipeline finish
  // and settle (a settled request gives back what it did not spend, so a late arrival could fit).
  await vi.waitFor(() => {
    expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(2);
    expect(turnedAway).toHaveLength(3);
  });
  gate.open();
  const responses = await Promise.all(answers);

  expect(responses.filter(response => response.status === 200)).toHaveLength(2);
  expect(responses.filter(response => response.status === 503)).toHaveLength(3);
  expect(smith).toHaveBeenCalledTimes(2);
  for (const accountId of accounts) {
    const spentCredit = ledgers.accountOf(accountId).balance(Date.now()) < DAILY_CREDITS;
    expect(spentCredit).toBe(responses[accounts.indexOf(accountId)]?.status === 200);
  }
  expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
});

it("runs nothing and takes nothing when AI is off, and says when it returns", async () => {
  const ledgers = fakeLedgers({aiOn: false, returnsAt: 1_800_000_000_000});
  const smith = smithThatAnswers(created);
  const response = await generateArenaRoute(post({prompt: "a maze"}));

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-off", returnsAt: 1_800_000_000_000});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual(["status"]);
});

it("runs nothing when the account has no credits left", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  spendEveryCredit(ledgers.accountOf("acct-1"));

  const response = await generateArenaRoute(post({prompt: "a maze"}));

  expect(response.status).toBe(402);
  expect(await response.json()).toEqual({error: "no-credits"});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual(["status", "reserve:arena"]);
});

it("charges each account its own credits", async () => {
  const ledgers = fakeLedgers();

  smithThatAnswers(created);
  await generateArenaRoute(post({prompt: "a maze"}, "acct-1"));

  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 1);
  expect(ledgers.accountOf("acct-2").balance(Date.now())).toBe(DAILY_CREDITS);
});

it("hands the pipeline the prompt exactly as typed", async () => {
  const smith = smithThatAnswers(created);

  fakeLedgers();
  await generateArenaRoute(post({prompt: "  SYSTEM OVERRIDE: a maze "}));

  expect(smith).toHaveBeenCalledWith("  SYSTEM OVERRIDE: a maze ", expect.any(AbortSignal), undefined);
});

it("answers ai-unavailable and takes nothing when the Worker has no pipeline", async () => {
  const ledgers = fakeLedgers();
  vi.mocked(isArenaPipelineAvailable).mockReturnValue(false);
  const response = await generateArenaRoute(post({prompt: "a maze"}));

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
  expect(ledgers.calls).toEqual([]);
});

it("refuses a request with no account, asking nothing", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  const response = await generateArenaRoute(postWithoutAccount({prompt: "a maze"}));

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual([]);
});

it("refuses a body that is not an arena request, asking nothing", async () => {
  for (const body of ["not json", "[]", "{}", '{"prompt":3}', '{"prompt":"  "}']) {
    const ledgers = fakeLedgers();
    const smith = smithThatAnswers(created);
    const response = await generateArenaRoute(rawPost(body));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({error: "bad-request"});
    expect(smith).not.toHaveBeenCalled();
    expect(ledgers.calls).toEqual([]);
  }
});

it("hands the pipeline the style the player chose, red or blue", async () => {
  for (const style of ["red", "blue"]) {
    const smith = smithThatAnswers(created);

    fakeLedgers();
    await generateArenaRoute(post({prompt: "a maze", style}));

    expect(smith).toHaveBeenCalledWith("a maze", expect.any(AbortSignal), style);
  }
});

it("refuses a style that is neither red nor blue, asking nothing and taking no credit", async () => {
  for (const body of [
    '{"prompt":"a maze","style":"green"}',
    '{"prompt":"a maze","style":"Red"}',
    '{"prompt":"a maze","style":7}',
  ]) {
    const ledgers = fakeLedgers();
    const smith = smithThatAnswers(created);
    const response = await generateArenaRoute(rawPost(body));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({error: "bad-request"});
    expect(smith).not.toHaveBeenCalled();
    expect(ledgers.calls).toEqual([]);
  }
});

it("takes no account from an X-Account-Id header: naming one proves nobody", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  const request = new Request("https://gunsmith.test/api/arenas", {
    method: "POST",
    headers: {"X-Account-Id": "acct-1"},
    body: JSON.stringify({prompt: "a maze"}),
  });

  const response = await generateArenaRoute(request);

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual([]);
});

it("turns away a session cookie nobody holds, or one that has expired, asking nothing", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  const expired = await signInPlayer({expiresAt: new Date(Date.now() - 1000)});

  for (const cookie of ["session=not-a-token-we-gave", expired.cookie]) {
    const request = new Request("https://gunsmith.test/api/arenas", {
      method: "POST",
      headers: {Cookie: cookie},
      body: JSON.stringify({prompt: "a maze"}),
    });
    const response = await generateArenaRoute(request);

    expect(response.status).toBe(401);
  }
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual([]);
});

it("refuses any way of asking but POST", async () => {
  const request = new Request("https://gunsmith.test/api/arenas", {headers: {Cookie: cookieOfPlayer("acct-1")}});
  smithThatAnswers(created);
  fakeLedgers();
  const response = await generateArenaRoute(request);

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("POST");
});

const created: ArenaOutcome = {
  status: "created",
  arena: {name: "Canyon"},
  refunded: false,
  nodes: ["precheck"],
  modelCalls: 2,
};

const createdAfterRepair: ArenaOutcome = {
  status: "created",
  arena: {name: "Canyon"},
  refunded: false,
  nodes: ["precheck", "moderate", "generate", "repair"],
  modelCalls: 3,
};

const rejected: ArenaOutcome = {
  status: "rejected",
  reason: "that is not an arena",
  refunded: false,
  nodes: ["precheck", "moderate"],
  modelCalls: 1,
};

const invalid: ArenaOutcome = {
  status: "invalid",
  reason: "no playable arena",
  refunded: false,
  nodes: ["generate", "repair"],
  modelCalls: 3,
};

const turnedAwayBeforeTheModel: ArenaOutcome = {
  status: "rejected",
  reason: "that is too long",
  refunded: true,
  nodes: ["precheck"],
  modelCalls: 0,
};

function smithThatAnswers(outcome: ArenaOutcome): MockedFunction<typeof runArenaPipeline> {
  return vi.mocked(runArenaPipeline).mockResolvedValue(outcome);
}

function smithThatWaits(): WaitingSmith {
  let markStarted: () => void = () => undefined;
  let answer: (outcome: ArenaOutcome) => void = () => undefined;
  let signalGiven: AbortSignal | undefined;
  const started = new Promise<void>(resolve => {
    markStarted = resolve;
  });
  const smith = (_prompt: string, signal: AbortSignal): Promise<ArenaOutcome> => {
    signalGiven = signal;
    markStarted();

    return new Promise<ArenaOutcome>(resolve => {
      answer = resolve;
    });
  };

  vi.mocked(runArenaPipeline).mockImplementation(smith);

  return {started, answer: outcome => answer(outcome), signalGiven: () => signalGiven};
}

async function withFakeTimers(body: () => Promise<void>): Promise<void> {
  vi.useFakeTimers();
  try {
    await body();
  } finally {
    vi.useRealTimers();
  }
}

function smithThatThrows(): void {
  vi.mocked(runArenaPipeline).mockRejectedValue(new Error("the model timed out"));
}

function post(body: unknown, accountId = "acct-1"): Request {
  return rawPost(JSON.stringify(body), accountId);
}

function rawPost(body: string, accountId = "acct-1"): Request {
  return new Request("https://gunsmith.test/api/arenas", {
    method: "POST",
    headers: {Cookie: cookieOfPlayer(accountId)},
    body,
  });
}

function postWithoutAccount(body: unknown): Request {
  return new Request("https://gunsmith.test/api/arenas", {method: "POST", body: JSON.stringify(body)});
}

function heldReservations(reservations: Record<string, SpendReservation>): number {
  return Object.values(reservations).filter(reservation => reservation.held).length;
}

function spendEveryCredit(account: CreditAccount): void {
  for (let index = 0; index < DAILY_CREDITS; index += 1) {
    account.reserve(`earlier-${index}`, "arena", Date.now());
  }
}

interface WaitingSmith {
  started: Promise<void>;
  answer: (outcome: ArenaOutcome) => void;
  signalGiven: () => AbortSignal | undefined;
}

interface Gate {
  opened: Promise<void>;
  open: () => void;
}

function openableGate(): Gate {
  let open: () => void = () => undefined;
  const opened = new Promise<void>(resolve => {
    open = resolve;
  });

  return {opened, open};
}

import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {saveItem} from "@src/shared/accounts/save-item/SaveItem";
import {savedItemsOfAccount} from "@src/shared/accounts/saved-items-of-account/SavedItemsOfAccount";
import {testAccounts} from "@src/shared/accounts/testing/in-memory/TestAccounts";
import {SHELF_LIMITS} from "@src/router/routes/library/limits/ShelfLimits";
import {isWeaponPipelineAvailable} from "@src/router/routes/weapons/pipeline/IsWeaponPipelineAvailable";
import {runWeaponPipeline} from "@src/router/routes/weapons/pipeline/RunWeaponPipeline";
import type {MockedFunction} from "vitest";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";
import type {CreditAccount} from "@src/durable-objects/credit-ledger/account/CreditAccount";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/weapon/WeaponSpend";
import {SPEND_CAPS} from "@src/durable-objects/spend-ledger/meter/SpendCaps";
import type {SpendReservation} from "@src/durable-objects/spend-ledger/types/SpendReservation";
import {PIPELINE_TIME_LIMIT_MILLISECONDS} from "@src/router/routes/shared/time-limit/PipelineTimeLimit";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import {generateWeaponRoute} from "@src/router/routes/weapons/GenerateWeaponRoute";
import {cookieOfPlayer} from "@src/router/routes/shared/fake-accounts/CookieOfPlayer";

it("takes a credit and answers the weapon when one is created", async () => {
  const ledgers = fakeLedgers();
  smithThatAnswers(created);
  const response = await generateWeaponRoute(post({prompt: "a hum-rifle"}));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    id: expect.any(String),
    status: "created",
    weapon: {name: "Hum"},
    appearance: drawing,
  });
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 1);
});

it("keeps the created weapon under the id it answers, off the shelf until it is saved by that id", async () => {
  fakeLedgers();
  smithThatAnswers(created);
  const answer = (await (await generateWeaponRoute(post({prompt: "a hum-rifle"}))).json()) as {id: string};

  expect(await savedItemsOfAccount("acct-1")).toEqual([]);
  expect(await saveItem({id: answer.id, userId: "acct-1", now: new Date(), limits: SHELF_LIMITS})).toEqual({
    status: "saved",
  });
  expect(await savedItemsOfAccount("acct-1")).toEqual([
    expect.objectContaining({
      id: answer.id,
      kind: "weapon",
      prompt: "a hum-rifle",
      payload: {weapon: {name: "Hum"}, appearance: drawing},
    }),
  ]);
});

it("gives each created weapon an id of its own", async () => {
  fakeLedgers();
  smithThatAnswers(created);
  const first = (await (await generateWeaponRoute(post({prompt: "one"}))).json()) as {id: string};
  const second = (await (await generateWeaponRoute(post({prompt: "two"}))).json()) as {id: string};

  expect(second.id).not.toBe(first.id);
});

it("keeps nothing and answers no id when the outcome is not a created weapon", async () => {
  const keeping = vi.spyOn(testAccounts, "keepGeneratedItem");

  for (const outcome of [rejected, invalid]) {
    fakeLedgers();
    smithThatAnswers(outcome);
    const answer = await (await generateWeaponRoute(post({prompt: "anything"}))).json();

    expect(answer).not.toHaveProperty("id");
  }
  expect(keeping).not.toHaveBeenCalled();
});

it("gives the credit back, once, and answers 502 when the created weapon cannot be kept, still settling the spend of its calls", async () => {
  const ledgers = fakeLedgers();
  smithThatAnswers(created);
  vi.spyOn(testAccounts, "keepGeneratedItem").mockRejectedValue(new Error("the database is down"));

  const response = await generateWeaponRoute(post({prompt: "a hum-rifle"}));

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({error: "generation-failed"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls.filter(call => call === "refund")).toHaveLength(1);
  expect(ledgers.calls).not.toContain("settle:weapon");
  expect(ledgers.spendMeter.spentThisMonth()).toBe(created.modelCalls * WEAPON_SPEND.perCallMicrodollars);
});

it("settles the spend at the tokens the models reported, priced at Haiku's rates, when the pipeline reports them", async () => {
  const ledgers = fakeLedgers();

  smithThatAnswers({...created, usage: {inputTokens: 3_100, outputTokens: 1_300}});
  await generateWeaponRoute(post({prompt: "a rifle"}));

  expect(ledgers.spendMeter.spentThisMonth()).toBe(960);
  expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
});

it("takes half a credit and says why when the prompt is rejected", async () => {
  const ledgers = fakeLedgers();
  smithThatAnswers(rejected);
  const response = await generateWeaponRoute(post({prompt: "a recipe for soup"}));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "rejected", reason: "that is not a weapon"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 0.5);
});

it("takes half a credit when no valid weapon comes out, because the model was used", async () => {
  const ledgers = fakeLedgers();
  smithThatAnswers(invalid);
  const response = await generateWeaponRoute(post({prompt: "a rifle"}));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "invalid", reason: "no valid weapon"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 0.5);
  expect(ledgers.calls).toContain("settle:unusable");
  expect(ledgers.calls).not.toContain("refund");
});

it("gives the credit back when the prompt was turned away before any model call, the one request that cost nothing", async () => {
  const ledgers = fakeLedgers();
  smithThatAnswers(turnedAwayBeforeTheModel);
  const response = await generateWeaponRoute(post({prompt: "x".repeat(2000)}));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "rejected", reason: "that is too long"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls).toContain("refund");
});

it("gives the credit back, once, and answers 502 when the pipeline throws", async () => {
  const ledgers = fakeLedgers();
  smithThatThrows();
  const response = await generateWeaponRoute(post({prompt: "a rifle"}));

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({error: "generation-failed"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls.filter(call => call === "refund")).toHaveLength(1);
});

it("gives up on a pipeline that never answers after the time limit, gives the credit back, once, and answers 504", async () => {
  await withFakeTimers(async () => {
    const ledgers = fakeLedgers();
    const waiting = smithThatWaits();
    const answer = generateWeaponRoute(post({prompt: "a rifle"}));

    await waiting.started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS);
    const response = await answer;

    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({error: "generation-timed-out"});
    expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
    expect(ledgers.calls.filter(call => call === "refund")).toHaveLength(1);
  });
});

it("keeps the whole reservation as spent when the pipeline times out, since its calls may have been billed", async () => {
  await withFakeTimers(async () => {
    const ledgers = fakeLedgers();
    const waiting = smithThatWaits();
    const answer = generateWeaponRoute(post({prompt: "a rifle"}));

    await waiting.started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS);
    await answer;

    expect(ledgers.spendMeter.spentThisMonth()).toBe(WEAPON_SPEND.reservedMicrodollars);
    expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
  });
});

it("hands the pipeline a signal that stays open while it is within its time limit", async () => {
  await withFakeTimers(async () => {
    fakeLedgers();
    const waiting = smithThatWaits();
    const answer = generateWeaponRoute(post({prompt: "a rifle"}));

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
    const answer = generateWeaponRoute(post({prompt: "a rifle"}));

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
    const answer = generateWeaponRoute(post({prompt: "a rifle"})).then(response => {
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
    const answer = generateWeaponRoute(post({prompt: "a rifle"}));

    await waiting.started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS);
    await answer;
    waiting.answer(created);
    await vi.advanceTimersByTimeAsync(0);

    expect(ledgers.calls.filter(call => call.startsWith("settle"))).toHaveLength(0);
    expect(ledgers.calls.filter(call => call === "spend:settle")).toHaveLength(1);
    expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  });
});

it("leaves no timer running once the pipeline has answered", async () => {
  await withFakeTimers(async () => {
    fakeLedgers();

    smithThatAnswers(created);
    await generateWeaponRoute(post({prompt: "a rifle"}));

    expect(vi.getTimerCount()).toBe(0);
  });
});

it("asks whether AI is on, then takes the credit, then reserves the spend, and settles both after the pipeline has run", async () => {
  const ledgers = fakeLedgers();

  smithThatAnswers(created);
  await generateWeaponRoute(post({prompt: "a rifle"}));

  expect(ledgers.calls).toEqual(["status", "reserve:weapon", "spend:reserve", "spend:settle", "settle:weapon"]);
});

it("holds the whole reservation against the spend while the pipeline runs", async () => {
  const ledgers = fakeLedgers();
  let heldDuringTheRun = 0;
  vi.mocked(runWeaponPipeline).mockImplementation(async () => {
    heldDuringTheRun = ledgers.spendMeter.spentThisMonth();

    return created;
  });

  await generateWeaponRoute(post({prompt: "a rifle"}));

  expect(heldDuringTheRun).toBe(WEAPON_SPEND.reservedMicrodollars);
});

it("settles the spend at the model calls the request made, whatever it came to", async () => {
  for (const outcome of [created, rejected, invalid]) {
    const ledgers = fakeLedgers();

    smithThatAnswers(outcome);
    await generateWeaponRoute(post({prompt: "a rifle"}));

    expect(ledgers.spendMeter.spentThisMonth()).toBe(outcome.modelCalls * WEAPON_SPEND.perCallMicrodollars);
    expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
  }
});

it("keeps the whole reservation as spent when the pipeline throws, since its calls may have been billed", async () => {
  const ledgers = fakeLedgers();

  smithThatThrows();
  await generateWeaponRoute(post({prompt: "a rifle"}));

  expect(ledgers.spendMeter.spentThisMonth()).toBe(WEAPON_SPEND.reservedMicrodollars);
  expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
});

it("runs nothing, gives the credit back and says when AI returns when the reservation would cross a spend cap", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  ledgers.spendMeter.reserve(
    "earlier",
    SPEND_CAPS.dailyMicrodollars - WEAPON_SPEND.reservedMicrodollars + 1,
    Date.now(),
  );

  const response = await generateWeaponRoute(post({prompt: "a rifle"}));

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-off", returnsAt: expect.any(Number)});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls).toEqual(["status", "reserve:weapon", "spend:reserve", "refund", "status"]);
});

it("lets exactly as many requests through as fit under the cap when they arrive together, and refunds the rest", async () => {
  const ledgers = fakeLedgers();
  const gate = openableGate();
  const smith = vi.mocked(runWeaponPipeline).mockImplementation(async () => {
    await gate.opened;

    return created;
  });
  const earlierSpend = SPEND_CAPS.dailyMicrodollars - 2 * WEAPON_SPEND.reservedMicrodollars;
  ledgers.spendMeter.reserve("earlier", earlierSpend, Date.now());
  ledgers.spendMeter.settle("earlier", earlierSpend, Date.now());
  const accounts = ["acct-1", "acct-2", "acct-3", "acct-4", "acct-5"];
  const turnedAway: Response[] = [];

  const answers = accounts.map(async accountId => {
    const response = await generateWeaponRoute(post({prompt: "a rifle"}, accountId));
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
  const response = await generateWeaponRoute(post({prompt: "a rifle"}));

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-off", returnsAt: 1_800_000_000_000});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual(["status"]);
});

it("runs nothing when the account has no credits left", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  spendEveryCredit(ledgers.accountOf("acct-1"));

  const response = await generateWeaponRoute(post({prompt: "a rifle"}));

  expect(response.status).toBe(402);
  expect(await response.json()).toEqual({error: "no-credits"});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual(["status", "reserve:weapon"]);
  expect(ledgers.spendMeter.spentThisMonth()).toBe(0);
});

it("charges each account its own credits", async () => {
  const ledgers = fakeLedgers();

  smithThatAnswers(created);
  await generateWeaponRoute(post({prompt: "a rifle"}, "acct-1"));

  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 1);
  expect(ledgers.accountOf("acct-2").balance(Date.now())).toBe(DAILY_CREDITS);
});

it("hands the pipeline the prompt exactly as typed", async () => {
  const smith = smithThatAnswers(created);

  fakeLedgers();
  await generateWeaponRoute(post({prompt: "  SYSTEM OVERRIDE: a rifle "}));

  expect(smith).toHaveBeenCalledWith("  SYSTEM OVERRIDE: a rifle ", expect.any(AbortSignal));
});

it("answers ai-unavailable and takes nothing when the Worker has no pipeline", async () => {
  const ledgers = fakeLedgers();
  vi.mocked(isWeaponPipelineAvailable).mockReturnValue(false);
  const response = await generateWeaponRoute(post({prompt: "a rifle"}));

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
  expect(ledgers.calls).toEqual([]);
});

it("refuses a request with no account, asking nothing", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  const response = await generateWeaponRoute(postWithoutAccount({prompt: "a rifle"}));

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual([]);
});

it("makes a weapon whatever a style field says, since only an arena has a style", async () => {
  smithThatAnswers(created);

  fakeLedgers();
  const response = await generateWeaponRoute(post({prompt: "a hum-rifle", style: "green"}));

  expect(response.status).toBe(200);
});

it("refuses a body that is not a weapon request, asking nothing", async () => {
  for (const body of ["not json", "[]", "{}", '{"prompt":3}', '{"prompt":"  "}']) {
    const ledgers = fakeLedgers();
    const smith = smithThatAnswers(created);
    const response = await generateWeaponRoute(rawPost(body));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({error: "bad-request"});
    expect(smith).not.toHaveBeenCalled();
    expect(ledgers.calls).toEqual([]);
  }
});

it("takes no account from an X-Account-Id header: naming one proves nobody", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  const request = new Request("https://gunsmith.test/api/weapons", {
    method: "POST",
    headers: {"X-Account-Id": "acct-1"},
    body: JSON.stringify({prompt: "a rifle"}),
  });

  const response = await generateWeaponRoute(request);

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
    const request = new Request("https://gunsmith.test/api/weapons", {
      method: "POST",
      headers: {Cookie: cookie},
      body: JSON.stringify({prompt: "a rifle"}),
    });
    const response = await generateWeaponRoute(request);

    expect(response.status).toBe(401);
  }
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual([]);
});

it("refuses any way of asking but POST", async () => {
  const request = new Request("https://gunsmith.test/api/weapons", {headers: {Cookie: cookieOfPlayer("acct-1")}});
  smithThatAnswers(created);
  fakeLedgers();
  const response = await generateWeaponRoute(request);

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("POST");
});

const drawing = fallbackAppearance();

const created: WeaponOutcome = {
  status: "created",
  weapon: {name: "Hum"},
  appearance: {
    status: "valid",
    appearance: drawing,
    changes: [],
    errors: [],
    nodes: ["generate", "validate"],
    modelCalls: 1,
    usage: {inputTokens: 900, outputTokens: 400},
  },
  nodes: ["precheck"],
  modelCalls: 3,
};

const rejected: WeaponOutcome = {
  status: "rejected",
  reason: "that is not a weapon",
  nodes: ["precheck", "moderate"],
  modelCalls: 1,
};

const invalid: WeaponOutcome = {status: "invalid", reason: "no valid weapon", nodes: ["generate"], modelCalls: 3};

const turnedAwayBeforeTheModel: WeaponOutcome = {
  status: "rejected",
  reason: "that is too long",
  nodes: ["precheck"],
  modelCalls: 0,
};

function smithThatAnswers(outcome: WeaponOutcome): MockedFunction<typeof runWeaponPipeline> {
  return vi.mocked(runWeaponPipeline).mockResolvedValue(outcome);
}

function smithThatWaits(): WaitingSmith {
  let markStarted: () => void = () => undefined;
  let answer: (outcome: WeaponOutcome) => void = () => undefined;
  let signalGiven: AbortSignal | undefined;
  const started = new Promise<void>(resolve => {
    markStarted = resolve;
  });
  const smith = (_prompt: string, signal: AbortSignal): Promise<WeaponOutcome> => {
    signalGiven = signal;
    markStarted();

    return new Promise<WeaponOutcome>(resolve => {
      answer = resolve;
    });
  };

  vi.mocked(runWeaponPipeline).mockImplementation(smith);

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
  vi.mocked(runWeaponPipeline).mockRejectedValue(new Error("the model timed out"));
}

function post(body: unknown, accountId = "acct-1"): Request {
  return rawPost(JSON.stringify(body), accountId);
}

function rawPost(body: string, accountId = "acct-1"): Request {
  return new Request("https://gunsmith.test/api/weapons", {
    method: "POST",
    headers: {Cookie: cookieOfPlayer(accountId)},
    body,
  });
}

function postWithoutAccount(body: unknown): Request {
  return new Request("https://gunsmith.test/api/weapons", {method: "POST", body: JSON.stringify(body)});
}

function heldReservations(reservations: Record<string, SpendReservation>): number {
  return Object.values(reservations).filter(reservation => reservation.held).length;
}

function spendEveryCredit(account: CreditAccount): void {
  for (let index = 0; index < DAILY_CREDITS; index += 1) {
    account.reserve(`earlier-${index}`, "weapon", Date.now());
  }
}

interface WaitingSmith {
  started: Promise<void>;
  answer: (outcome: WeaponOutcome) => void;
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

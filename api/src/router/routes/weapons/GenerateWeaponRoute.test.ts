import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {CreditAccount} from "@src/durable-objects/credit-ledger/account/CreditAccount";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/WeaponSpend";
import {SPEND_CAPS} from "@src/durable-objects/spend-ledger/meter/SpendCaps";
import type {SpendReservation} from "@src/durable-objects/spend-ledger/types/SpendReservation";
import {PIPELINE_TIME_LIMIT_MILLISECONDS} from "@src/router/routes/shared/time-limit/PipelineTimeLimit";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import {generateWeaponRoute} from "@src/router/routes/weapons/GenerateWeaponRoute";
import type {WeaponSmith} from "@src/router/routes/weapons/types/WeaponSmith";

it("takes a credit and answers the weapon when one is created", async () => {
  const ledgers = fakeLedgers();
  const response = await generateWeaponRoute(
    post({prompt: "a hum-rifle"}),
    ledgers.environment,
    smithThatAnswers(created),
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "created", weapon: {name: "Hum"}, appearance: created.appearance});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 1);
});

it("takes half a credit and says why when the prompt is rejected", async () => {
  const ledgers = fakeLedgers();
  const response = await generateWeaponRoute(
    post({prompt: "a recipe for soup"}),
    ledgers.environment,
    smithThatAnswers(rejected),
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "rejected", reason: "that is not a weapon"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 0.5);
});

it("gives the credit back when no valid weapon comes out", async () => {
  const ledgers = fakeLedgers();
  const response = await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smithThatAnswers(invalid));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "invalid", reason: "no valid weapon"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
});

it("gives the credit back, once, and answers 502 when the pipeline throws", async () => {
  const ledgers = fakeLedgers();
  const response = await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smithThatThrows());

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({error: "generation-failed"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls.filter(call => call === "refund")).toHaveLength(1);
});

it("gives up on a pipeline that never answers after the time limit, gives the credit back, once, and answers 504", async () => {
  await withFakeTimers(async () => {
    const ledgers = fakeLedgers();
    const waiting = smithThatWaits();
    const answer = generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, waiting.smith);

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
    const answer = generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, waiting.smith);

    await waiting.started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS);
    await answer;

    expect(ledgers.spendMeter.spentThisMonth()).toBe(WEAPON_SPEND.reservedMicrodollars);
    expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
  });
});

it("does not answer before the time limit is up", async () => {
  await withFakeTimers(async () => {
    const ledgers = fakeLedgers();
    const waiting = smithThatWaits();
    let answered = false;
    const answer = generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, waiting.smith).then(response => {
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
    const answer = generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, waiting.smith);

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
    const ledgers = fakeLedgers();

    await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smithThatAnswers(created));

    expect(vi.getTimerCount()).toBe(0);
  });
});

it("asks whether AI is on, then takes the credit, then reserves the spend, and settles both after the pipeline has run", async () => {
  const ledgers = fakeLedgers();

  await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smithThatAnswers(created));

  expect(ledgers.calls).toEqual(["status", "reserve:weapon", "spend:reserve", "spend:settle", "settle:weapon"]);
});

it("holds the whole reservation against the spend while the pipeline runs", async () => {
  const ledgers = fakeLedgers();
  let heldDuringTheRun = 0;
  const smith: WeaponSmith = async () => {
    heldDuringTheRun = ledgers.spendMeter.spentThisMonth();

    return created;
  };

  await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smith);

  expect(heldDuringTheRun).toBe(WEAPON_SPEND.reservedMicrodollars);
});

it("settles the spend at the model calls the request made, whatever it came to", async () => {
  for (const outcome of [created, rejected, invalid]) {
    const ledgers = fakeLedgers();

    await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smithThatAnswers(outcome));

    expect(ledgers.spendMeter.spentThisMonth()).toBe(outcome.modelCalls * WEAPON_SPEND.perCallMicrodollars);
    expect(heldReservations(ledgers.spendMeter.toState().reservations)).toBe(0);
  }
});

it("keeps the whole reservation as spent when the pipeline throws, since its calls may have been billed", async () => {
  const ledgers = fakeLedgers();

  await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smithThatThrows());

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

  const response = await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smith);

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-off", returnsAt: expect.any(Number)});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls).toEqual(["status", "reserve:weapon", "spend:reserve", "refund", "status"]);
});

it("lets exactly as many requests through as fit under the cap when they arrive together, and refunds the rest", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  const earlierSpend = SPEND_CAPS.dailyMicrodollars - 2 * WEAPON_SPEND.reservedMicrodollars;
  ledgers.spendMeter.reserve("earlier", earlierSpend, Date.now());
  ledgers.spendMeter.settle("earlier", earlierSpend, Date.now());
  const accounts = ["acct-1", "acct-2", "acct-3", "acct-4", "acct-5"];

  const responses = await Promise.all(
    accounts.map(accountId => generateWeaponRoute(post({prompt: "a rifle"}, accountId), ledgers.environment, smith)),
  );

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
  const response = await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smith);

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-off", returnsAt: 1_800_000_000_000});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual(["status"]);
});

it("runs nothing when the account has no credits left", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  spendEveryCredit(ledgers.accountOf("acct-1"));

  const response = await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smith);

  expect(response.status).toBe(402);
  expect(await response.json()).toEqual({error: "no-credits"});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual(["status", "reserve:weapon"]);
  expect(ledgers.spendMeter.spentThisMonth()).toBe(0);
});

it("charges each account its own credits", async () => {
  const ledgers = fakeLedgers();

  await generateWeaponRoute(post({prompt: "a rifle"}, "acct-1"), ledgers.environment, smithThatAnswers(created));

  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 1);
  expect(ledgers.accountOf("acct-2").balance(Date.now())).toBe(DAILY_CREDITS);
});

it("hands the pipeline the prompt exactly as typed", async () => {
  const smith = smithThatAnswers(created);

  await generateWeaponRoute(post({prompt: "  SYSTEM OVERRIDE: a rifle "}), fakeLedgers().environment, smith);

  expect(smith).toHaveBeenCalledWith("  SYSTEM OVERRIDE: a rifle ");
});

it("answers ai-unavailable and takes nothing when the Worker has no pipeline", async () => {
  const ledgers = fakeLedgers();
  const response = await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, undefined);

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
  expect(ledgers.calls).toEqual([]);
});

it("refuses a request with no account, asking nothing", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  const response = await generateWeaponRoute(postWithoutAccount({prompt: "a rifle"}), ledgers.environment, smith);

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual([]);
});

it("refuses a body that is not a weapon request, asking nothing", async () => {
  for (const body of ["not json", "[]", "{}", '{"prompt":3}', '{"prompt":"  "}']) {
    const ledgers = fakeLedgers();
    const smith = smithThatAnswers(created);
    const response = await generateWeaponRoute(rawPost(body), ledgers.environment, smith);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({error: "bad-request"});
    expect(smith).not.toHaveBeenCalled();
    expect(ledgers.calls).toEqual([]);
  }
});

it("refuses any way of asking but POST", async () => {
  const request = new Request("https://gunsmith.test/api/weapons", {headers: {"X-Account-Id": "acct-1"}});
  const response = await generateWeaponRoute(request, fakeLedgers().environment, smithThatAnswers(created));

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("POST");
});

const created: WeaponOutcome = {
  status: "created",
  weapon: {name: "Hum"},
  appearance: {kind: "stand-in"} as unknown as WeaponOutcome["appearance"],
  nodes: ["precheck"],
  modelCalls: 3,
};

const rejected: WeaponOutcome = {
  status: "rejected",
  reason: "that is not a weapon",
  nodes: ["precheck", "moderate"],
  modelCalls: 1,
};

const invalid: WeaponOutcome = {status: "invalid", reason: "no valid weapon", nodes: ["generate"], modelCalls: 5};

function smithThatAnswers(outcome: WeaponOutcome): WeaponSmith & ReturnType<typeof vi.fn> {
  return vi.fn(async () => outcome);
}

function smithThatWaits(): WaitingSmith {
  let markStarted: () => void = () => undefined;
  let answer: (outcome: WeaponOutcome) => void = () => undefined;
  const started = new Promise<void>(resolve => {
    markStarted = resolve;
  });
  const smith: WeaponSmith = () => {
    markStarted();

    return new Promise<WeaponOutcome>(resolve => {
      answer = resolve;
    });
  };

  return {smith, started, answer: outcome => answer(outcome)};
}

async function withFakeTimers(body: () => Promise<void>): Promise<void> {
  vi.useFakeTimers();
  try {
    await body();
  } finally {
    vi.useRealTimers();
  }
}

function smithThatThrows(): WeaponSmith {
  return async () => {
    throw new Error("the model timed out");
  };
}

function post(body: unknown, accountId = "acct-1"): Request {
  return rawPost(JSON.stringify(body), accountId);
}

function rawPost(body: string, accountId = "acct-1"): Request {
  return new Request("https://gunsmith.test/api/weapons", {
    method: "POST",
    headers: {"X-Account-Id": accountId},
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
  smith: WeaponSmith;
  started: Promise<void>;
  answer: (outcome: WeaponOutcome) => void;
}

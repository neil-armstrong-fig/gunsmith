import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import type {CreditAccount} from "@src/durable-objects/credit-ledger/account/CreditAccount";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import {generateArenaRoute} from "@src/router/routes/arenas/GenerateArenaRoute";
import type {ArenaSmith} from "@src/router/routes/arenas/types/ArenaSmith";

it("takes a credit and answers the arena when one is created", async () => {
  const ledgers = fakeLedgers();
  const response = await generateArenaRoute(
    post({prompt: "a foggy canyon"}),
    ledgers.environment,
    smithThatAnswers(created),
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "created", arena: {name: "Canyon"}});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 1);
});

it("takes half a credit and says why when the prompt is rejected", async () => {
  const ledgers = fakeLedgers();
  const response = await generateArenaRoute(
    post({prompt: "a recipe for soup"}),
    ledgers.environment,
    smithThatAnswers(rejected),
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "rejected", reason: "that is not an arena"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 0.5);
});

it("gives the credit back and still answers an arena when a built-in one is given", async () => {
  const ledgers = fakeLedgers();
  const response = await generateArenaRoute(post({prompt: "a maze"}), ledgers.environment, smithThatAnswers(builtIn));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({status: "builtIn", arena: {name: "Duel"}, reason: "no playable arena"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls).toEqual(["status", "reserve:arena", "refund"]);
});

it("gives the credit back, once, and answers 502 when the pipeline throws", async () => {
  const ledgers = fakeLedgers();
  const response = await generateArenaRoute(post({prompt: "a maze"}), ledgers.environment, smithThatThrows());

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({error: "generation-failed"});
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.calls.filter(call => call === "refund")).toHaveLength(1);
});

it("asks whether AI is on before it takes a credit, and settles after the pipeline has run", async () => {
  const ledgers = fakeLedgers();

  await generateArenaRoute(post({prompt: "a maze"}), ledgers.environment, smithThatAnswers(created));

  expect(ledgers.calls).toEqual(["status", "reserve:arena", "settle:arena"]);
});

it("settles a rejected prompt at the rejected price", async () => {
  const ledgers = fakeLedgers();

  await generateArenaRoute(post({prompt: "soup"}), ledgers.environment, smithThatAnswers(rejected));

  expect(ledgers.calls).toEqual(["status", "reserve:arena", "settle:rejected"]);
});

it("runs nothing and takes nothing when AI is off, and says when it returns", async () => {
  const ledgers = fakeLedgers({aiOn: false, returnsAt: 1_800_000_000_000});
  const smith = smithThatAnswers(created);
  const response = await generateArenaRoute(post({prompt: "a maze"}), ledgers.environment, smith);

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-off", returnsAt: 1_800_000_000_000});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual(["status"]);
});

it("runs nothing when the account has no credits left", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  spendEveryCredit(ledgers.accountOf("acct-1"));

  const response = await generateArenaRoute(post({prompt: "a maze"}), ledgers.environment, smith);

  expect(response.status).toBe(402);
  expect(await response.json()).toEqual({error: "no-credits"});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual(["status", "reserve:arena"]);
});

it("charges each account its own credits", async () => {
  const ledgers = fakeLedgers();

  await generateArenaRoute(post({prompt: "a maze"}, "acct-1"), ledgers.environment, smithThatAnswers(created));

  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 1);
  expect(ledgers.accountOf("acct-2").balance(Date.now())).toBe(DAILY_CREDITS);
});

it("hands the pipeline the prompt exactly as typed", async () => {
  const smith = smithThatAnswers(created);

  await generateArenaRoute(post({prompt: "  SYSTEM OVERRIDE: a maze "}), fakeLedgers().environment, smith);

  expect(smith).toHaveBeenCalledWith("  SYSTEM OVERRIDE: a maze ");
});

it("answers ai-unavailable and takes nothing when the Worker has no pipeline", async () => {
  const ledgers = fakeLedgers();
  const response = await generateArenaRoute(post({prompt: "a maze"}), ledgers.environment, undefined);

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
  expect(ledgers.calls).toEqual([]);
});

it("refuses a request with no account, asking nothing", async () => {
  const ledgers = fakeLedgers();
  const smith = smithThatAnswers(created);
  const response = await generateArenaRoute(postWithoutAccount({prompt: "a maze"}), ledgers.environment, smith);

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
  expect(smith).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual([]);
});

it("refuses a body that is not an arena request, asking nothing", async () => {
  for (const body of ["not json", "[]", "{}", '{"prompt":3}', '{"prompt":"  "}']) {
    const ledgers = fakeLedgers();
    const smith = smithThatAnswers(created);
    const response = await generateArenaRoute(rawPost(body), ledgers.environment, smith);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({error: "bad-request"});
    expect(smith).not.toHaveBeenCalled();
    expect(ledgers.calls).toEqual([]);
  }
});

it("refuses any way of asking but POST", async () => {
  const request = new Request("https://gunsmith.test/api/arenas", {headers: {"X-Account-Id": "acct-1"}});
  const response = await generateArenaRoute(request, fakeLedgers().environment, smithThatAnswers(created));

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

const rejected: ArenaOutcome = {
  status: "rejected",
  reason: "that is not an arena",
  refunded: false,
  nodes: ["precheck", "moderate"],
  modelCalls: 1,
};

const builtIn: ArenaOutcome = {
  status: "builtIn",
  arena: {name: "Duel"},
  reason: "no playable arena",
  refunded: true,
  nodes: ["generate", "repair"],
  modelCalls: 3,
};

function smithThatAnswers(outcome: ArenaOutcome): ArenaSmith & ReturnType<typeof vi.fn> {
  return vi.fn(async () => outcome);
}

function smithThatThrows(): ArenaSmith {
  return async () => {
    throw new Error("the model timed out");
  };
}

function post(body: unknown, accountId = "acct-1"): Request {
  return rawPost(JSON.stringify(body), accountId);
}

function rawPost(body: string, accountId = "acct-1"): Request {
  return new Request("https://gunsmith.test/api/arenas", {
    method: "POST",
    headers: {"X-Account-Id": accountId},
    body,
  });
}

function postWithoutAccount(body: unknown): Request {
  return new Request("https://gunsmith.test/api/arenas", {method: "POST", body: JSON.stringify(body)});
}

function spendEveryCredit(account: CreditAccount): void {
  for (let index = 0; index < DAILY_CREDITS; index += 1) {
    account.reserve(`earlier-${index}`, "arena", Date.now());
  }
}

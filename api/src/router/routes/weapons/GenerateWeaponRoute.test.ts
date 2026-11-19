import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {CreditAccount} from "@src/durable-objects/credit-ledger/account/CreditAccount";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
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

it("asks whether AI is on before it takes a credit, and settles after the pipeline has run", async () => {
  const ledgers = fakeLedgers();

  await generateWeaponRoute(post({prompt: "a rifle"}), ledgers.environment, smithThatAnswers(created));

  expect(ledgers.calls).toEqual(["status", "reserve:weapon", "settle:weapon"]);
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

function spendEveryCredit(account: CreditAccount): void {
  for (let index = 0; index < DAILY_CREDITS; index += 1) {
    account.reserve(`earlier-${index}`, "weapon", Date.now());
  }
}

import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/weapon/WeaponSpend";
import {SPEND_CAPS} from "@src/durable-objects/spend-ledger/meter/SpendCaps";
import {handleApiRequest} from "@src/router/HandleApiRequest";
import {runArenaPipeline} from "@src/router/routes/arenas/pipeline/RunArenaPipeline";
import {cookieOfPlayer} from "@src/router/routes/shared/fake-accounts/CookieOfPlayer";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import {runWeaponPipeline} from "@src/router/routes/weapons/pipeline/RunWeaponPipeline";
import type {FakeLedgers} from "@src/router/routes/shared/fake-ledgers/types/FakeLedgers";
import type {SpendCaps} from "@src/durable-objects/spend-ledger/types/SpendCaps";

/**
 * The shutdown drill (`docs/cost-and-budget.md`): set a tiny budget, exceed it, and confirm that calls stop, the banner has what it needs
 * and the game still plays. Here the tiny budget is a daily cap that has room for one weapon (the reservation plus a little) and not two,
 * the same lowering the `DAILY_SPEND_CAP_MICRODOLLARS` var gives a running Worker. The live drill repeats it against a deployed Worker.
 */
const ROOM_FOR_ONE_WEAPON = WEAPON_SPEND.reservedMicrodollars + 1_000;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

it("lets a generation through while the tiny budget has room, then refuses the next with ai-off and gives its credit back", async () => {
  const ledgers = startDrill();

  const first = await handleApiRequest(weaponRequest());
  const second = await handleApiRequest(weaponRequest());

  expect(first.status).toBe(200);
  expect(second.status).toBe(503);
  expect(await second.json()).toEqual({error: "ai-off", returnsAt: expect.any(Number)});
  expect(runWeaponPipeline).toHaveBeenCalledTimes(1);
  expect(ledgers.accountOf("acct-1").balance(Date.now())).toBe(DAILY_CREDITS - 1);
});

it("stops the arena route too, since the one global budget is spent", async () => {
  startDrill();
  await spendTheBudget();

  const arena = await handleApiRequest(arenaRequest());

  expect(arena.status).toBe(503);
  expect(await arena.json()).toEqual({error: "ai-off", returnsAt: expect.any(Number)});
  expect(runArenaPipeline).not.toHaveBeenCalled();
});

it("tells the credit read that AI is off and when it returns, for the banner", async () => {
  startDrill();
  await spendTheBudget();

  const status = await handleApiRequest(
    new Request("https://gunsmith.test/api/credits", {headers: {Cookie: cookie()}}),
  );

  const answer = (await status.json()) as {aiOn: boolean; returnsAt: number};
  expect(status.status).toBe(200);
  expect(answer.aiOn).toBe(false);
  expect(answer.returnsAt).toBeGreaterThan(Date.now());
  expect(answer.returnsAt).toBeLessThanOrEqual(Date.now() + DAY_IN_MILLISECONDS);
});

it("keeps guests and the saved shelf working while AI is off", async () => {
  startDrill();
  await spendTheBudget();

  const room = await handleApiRequest(
    new Request("https://gunsmith.test/api/rooms", {method: "POST", headers: FROM_THE_SITE}),
  );
  const guest = await handleApiRequest(new Request("https://gunsmith.test/api/me"));
  const shelf = await handleApiRequest(new Request("https://gunsmith.test/api/library", {headers: {Cookie: cookie()}}));

  expect(room.status).toBe(201);
  expect(await guest.json()).toEqual({signedIn: false});
  expect(shelf.status).toBe(200);
  expect(await shelf.json()).toMatchObject({weapons: [], arenas: []});
});

it("refuses the very first generation when the budget is zero", async () => {
  startDrill({dailyMicrodollars: 0});

  const response = await handleApiRequest(weaponRequest());

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-off", returnsAt: expect.any(Number)});
  expect(runWeaponPipeline).not.toHaveBeenCalled();
});

const FROM_THE_SITE = {Origin: "https://gunsmith.test"};

const created: WeaponOutcome = {
  status: "created",
  weapon: {name: "Hum"},
  appearance: {kind: "stand-in"} as unknown as WeaponOutcome["appearance"],
  nodes: ["precheck"],
  modelCalls: 3,
};

/** A signed-in player and ledgers whose daily cap is tiny: room for one weapon, or none when `dailyMicrodollars` says so. */
function startDrill(caps: Partial<SpendCaps> = {}): FakeLedgers {
  vi.mocked(runWeaponPipeline).mockResolvedValue(created);

  return fakeLedgers({caps: {...SPEND_CAPS, dailyMicrodollars: ROOM_FOR_ONE_WEAPON, ...caps}});
}

/** Generates one weapon, which spends the tiny budget, and checks the next is turned away, so a later test starts with AI really off. */
async function spendTheBudget(): Promise<void> {
  expect((await handleApiRequest(weaponRequest())).status).toBe(200);
  expect((await handleApiRequest(weaponRequest())).status).toBe(503);
}

function weaponRequest(): Request {
  return new Request("https://gunsmith.test/api/weapons", {
    method: "POST",
    headers: {...FROM_THE_SITE, Cookie: cookie()},
    body: JSON.stringify({prompt: "a hum-rifle"}),
  });
}

function arenaRequest(): Request {
  return new Request("https://gunsmith.test/api/arenas", {
    method: "POST",
    headers: {...FROM_THE_SITE, Cookie: cookie()},
    body: JSON.stringify({prompt: "a maze"}),
  });
}

function cookie(): string {
  return cookieOfPlayer("acct-1");
}

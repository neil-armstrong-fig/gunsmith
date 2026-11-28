import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {testAccounts} from "@src/shared/accounts/testing/in-memory/TestAccounts";
import {arenasOfToday} from "@src/durable-objects/match/arenas-of-today/ArenasOfToday";

const NOW = Date.parse("2026-11-24T15:00:00Z");
const TODAY = Math.floor(NOW / 86_400_000);

it("offers five of the built-in arenas", async () => {
  const offered = await arenasOfToday(NOW);

  expect(offered).toHaveLength(5);
  expect(offered.every(name => BUILT_IN_ARENAS.some(arena => arena.name === name))).toBe(true);
});

it("keeps the two arenas most played yesterday", async () => {
  await play("Labyrinth", TODAY - 1, 3);
  await play("Keep", TODAY - 1, 2);
  await play("Slalom", TODAY - 1, 1);

  expect(await arenasOfToday(NOW)).toEqual(expect.arrayContaining(["Labyrinth", "Keep"]));
});

it("is not changed by what is played today", async () => {
  const before = await arenasOfToday(NOW);

  await play("Catwalk", TODAY, 50);

  expect(await arenasOfToday(NOW)).toEqual(before);
});

async function play(arena: string, day: number, times: number): Promise<void> {
  for (let time = 0; time < times; time += 1) {
    await testAccounts.countArenaPlay(arena, day);
  }
}

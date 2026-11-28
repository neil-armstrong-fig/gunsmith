import {arenaPlaysSince} from "@src/shared/accounts/arena-plays-since/ArenaPlaysSince";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/shared/accounts/arena-plays-since/ArenaPlaysSince");

const emptyDatabase = useLocalDatabase();

it("reads the plays of the day asked for and every day after it, and none before", async () => {
  const database = await emptyDatabase();
  await database
    .prepare("INSERT INTO arena_plays (day, arena, plays) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)")
    .bind(19_999, "Keep", 4, 20_000, "Slalom", 2, 20_003, "Keep", 1)
    .run();

  const plays = await arenaPlaysSince(20_000);

  expect([...plays].sort((first, second) => first.day - second.day)).toEqual([
    {arena: "Slalom", day: 20_000, count: 2},
    {arena: "Keep", day: 20_003, count: 1},
  ]);
});

it("reads nothing when nothing has been played", async () => {
  await emptyDatabase();

  expect(await arenaPlaysSince(20_000)).toEqual([]);
});

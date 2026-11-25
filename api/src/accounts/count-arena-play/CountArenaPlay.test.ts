import {countArenaPlay} from "@src/accounts/count-arena-play/CountArenaPlay";
import {rowsOf} from "@src/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/accounts/count-arena-play/CountArenaPlay");

const emptyDatabase = useLocalDatabase();

it("makes a row for the first play of an arena on a day", async () => {
  const database = await emptyDatabase();

  await countArenaPlay("Keep", 20_000);

  expect(await rowsOf(database, "SELECT day, arena, plays FROM arena_plays")).toEqual([
    {day: 20_000, arena: "Keep", plays: 1},
  ]);
});

it("adds each later play of the same arena on the same day to its row", async () => {
  const database = await emptyDatabase();

  await countArenaPlay("Keep", 20_000);
  await countArenaPlay("Keep", 20_000);
  await countArenaPlay("Keep", 20_000);

  expect(await rowsOf(database, "SELECT plays FROM arena_plays")).toEqual([{plays: 3}]);
});

it("counts another arena, or another day, on a row of its own", async () => {
  const database = await emptyDatabase();

  await countArenaPlay("Keep", 20_000);
  await countArenaPlay("Slalom", 20_000);
  await countArenaPlay("Keep", 20_001);

  expect(await rowsOf(database, "SELECT day, arena, plays FROM arena_plays ORDER BY day, arena")).toEqual([
    {day: 20_000, arena: "Keep", plays: 1},
    {day: 20_000, arena: "Slalom", plays: 1},
    {day: 20_001, arena: "Keep", plays: 1},
  ]);
});

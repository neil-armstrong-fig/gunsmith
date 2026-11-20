import alchemy, {Scope} from "alchemy";
import {D1Database} from "alchemy/cloudflare";
import {FileSystemStateStore} from "alchemy/state";
import {buildApiDatabase} from "@src/api-database/BuildApiDatabase";
import {workspacePath} from "@src/paths/WorkspacePath";

vi.mock("alchemy/cloudflare", () => ({D1Database: vi.fn()}));

it("adopts D1 in the Alchemy app's active stage", async () => {
  const app = await alchemy("test", {
    stage: "prod",
    phase: "read",
    noTrack: true,
    stateStore: scope => new FileSystemStateStore(scope),
  });
  vi.mocked(D1Database, {partial: true}).mockImplementation(async () => {
    expect(Scope.current.chain).toEqual([...app.chain, "prod"]);
    return {id: "11111111-1111-1111-1111-111111111111"};
  });

  const apiDatabase = await buildApiDatabase();

  expect(apiDatabase.id).toBe("11111111-1111-1111-1111-111111111111");
  expect(D1Database).toHaveBeenCalledExactlyOnceWith("database", {
    name: "gunsmith",
    migrationsDir: workspacePath("api/migrations"),
    adopt: true,
    delete: false,
  });
});

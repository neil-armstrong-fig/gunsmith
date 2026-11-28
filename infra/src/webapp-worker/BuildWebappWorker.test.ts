import {Scope} from "alchemy";
import * as cloudflare from "alchemy/cloudflare";
import {workspacePath} from "@src/paths/WorkspacePath";
import {buildWebappWorker} from "@src/webapp-worker/BuildWebappWorker";

vi.mock("alchemy/cloudflare", async importOriginal => ({
  ...(await importOriginal<typeof cloudflare>()),
  Worker: vi.fn(),
}));

it("serves the compiled webapp as static assets from the adopted webapp Worker", async () => {
  const scope = new Scope({scopeName: "test", stage: "test", phase: "up", parent: null, noTrack: true});
  vi.mocked(cloudflare.Worker, {partial: true}).mockImplementation(async () => {
    expect(Scope.current).toBe(scope);
    return {name: "gunsmith-webapp"};
  });

  const webappWorker = await scope.run(buildWebappWorker);

  expect(webappWorker.name).toBe("gunsmith-webapp");
  expect(cloudflare.Worker).toHaveBeenCalledExactlyOnceWith(
    "webapp",
    expect.objectContaining({
      name: "gunsmith-webapp",
      compatibilityDate: "2026-11-01",
      adopt: true,
      url: false,
      previewSubdomains: false,
      assets: {html_handling: "auto-trailing-slash", not_found_handling: "none", run_worker_first: false},
      bindings: {ASSETS: {type: "assets", path: workspacePath("webapp/build")}},
    }),
  );
});

it("leaves the custom domain to the Cloudflare dashboard", async () => {
  const scope = new Scope({scopeName: "test", stage: "test", phase: "up", parent: null, noTrack: true});
  vi.mocked(cloudflare.Worker, {partial: true}).mockResolvedValue({name: "gunsmith-webapp"});

  await scope.run(buildWebappWorker);

  const props = vi.mocked(cloudflare.Worker).mock.lastCall?.[1];

  expect(props).not.toHaveProperty("domains");
  expect(props).not.toHaveProperty("routes");
});

it("answers a path with no asset with a noindex 404", async () => {
  const scope = new Scope({scopeName: "test", stage: "test", phase: "up", parent: null, noTrack: true});
  vi.mocked(cloudflare.Worker, {partial: true}).mockResolvedValue({name: "gunsmith-webapp"});

  await scope.run(buildWebappWorker);
  const script = vi.mocked(cloudflare.Worker).mock.lastCall?.[1].script ?? "";
  const worker = await importScript(script);
  const response = await worker.default.fetch(new Request("https://gunsmith.example/missing"));

  expect(response.status).toBe(404);
  expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
});

async function importScript(script: string): Promise<StaticWorkerModule> {
  const module: unknown = await import(`data:text/javascript,${encodeURIComponent(script)}`);
  return module as StaticWorkerModule;
}

interface StaticWorkerModule {
  default: StaticWorker;
}

interface StaticWorker {
  fetch(request: Request): Promise<Response> | Response;
}

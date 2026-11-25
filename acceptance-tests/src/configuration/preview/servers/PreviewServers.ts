import type {WebServer} from "@src/configuration/preview/types/WebServer";
import type {PreviewServerOptions} from "@src/configuration/preview/servers/types/PreviewServerOptions";

const lifecycle = {
  reuseExistingServer: false,
  timeout: 60_000,
  gracefulShutdown: {signal: "SIGTERM", timeout: 5_000},
  stdout: "pipe",
  stderr: "pipe",
} as const;

export function previewServers(previewServerOptions: PreviewServerOptions): WebServer[] {
  const {webappPort, apiPort, apiUrl} = previewServerOptions;
  const webServer: WebServer = {
    ...lifecycle,
    name: "Preview",
    command: `pnpm --filter @gunsmith/webapp preview --host 127.0.0.1 --port ${webappPort} --strictPort`,
    url: `http://127.0.0.1:${webappPort}`,
    env: {API_URL: apiUrl},
  };
  if (apiPort === undefined) return [webServer];

  return [
    {
      ...lifecycle,
      name: "Worker",
      // The Worker's own D1 gets the migrations first: the room reads the day's arena plays from it (a room with no table offers every arena).
      command: `pnpm --filter @gunsmith/api exec wrangler d1 migrations apply gunsmith --local --persist-to .wrangler/acceptance-${apiPort} && pnpm --filter @gunsmith/api exec wrangler dev --local --ip 127.0.0.1 --port ${apiPort} --inspector-port 0 --persist-to .wrangler/acceptance-${apiPort} --var ALLOW_LOOPBACK_ORIGINS:true`,
      port: apiPort,
      env: {WRANGLER_SEND_METRICS: "false"},
    },
    webServer,
  ];
}

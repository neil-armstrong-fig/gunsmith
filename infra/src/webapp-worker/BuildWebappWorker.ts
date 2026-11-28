import {Assets, Worker} from "alchemy/cloudflare";
import {workspacePath} from "@src/paths/WorkspacePath";

/**
 * Cloudflare serves every path that matches a file in the build before the script runs; Alchemy needs a script, so this
 * one only answers what no asset matches, as the assets-only Worker did, and keeps that answer out of search too.
 */
const NOT_FOUND_SCRIPT = `
  export default {
    fetch() {
      return new Response("Not Found", {status: 404, headers: {"X-Robots-Tag": "noindex"}});
    },
  };
`;

export async function buildWebappWorker(): ReturnType<typeof Worker> {
  return Worker("webapp", {
    name: "gunsmith-webapp",
    script: NOT_FOUND_SCRIPT,
    compatibilityDate: "2026-11-01",
    adopt: true,
    url: false,
    previewSubdomains: false,
    assets: {html_handling: "auto-trailing-slash", not_found_handling: "none", run_worker_first: false},
    bindings: {ASSETS: await Assets({path: workspacePath("webapp/build")})},
  });
}

import {join, resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {browserFailures} from "@gunsmith/audio-studies/browser/run/BrowserFailures";
import {verifyBrowser} from "@gunsmith/audio-studies/browser/run/VerifyBrowser";
import {loadPlaywright} from "@gunsmith/audio-studies/browser/playwright/LoadPlaywright";
import {serveFolder} from "@gunsmith/audio-studies/browser/serve/ServeFolder";
import {REPORT_FILES} from "@gunsmith/audio-studies/encoding/report/ReportFiles";
import {writeReport} from "@gunsmith/audio-studies/encoding/report/WriteReport";
import type {BrowserResult} from "@gunsmith/audio-studies/browser/run/types/BrowserResult";

/** The page, and the exports it fetches. Nothing else in the package is served. */
const SERVED_FOLDERS = ["/generator-scripts/browser/page/", "/encoded-audio/"];

// Node's native TypeScript support runs this entry point without a transpiler.
const entry = process.argv[1];
if (entry && pathToFileURL(resolve(entry)).href === import.meta.url) {
  const clean = await verifyBrowserAudio(resolve(import.meta.dirname, "../.."));
  if (!clean) {
    process.exitCode = 1;
  }
}

/**
 * Decodes every export in Chromium and WebKit, which is the check that a real browser plays what the encoder made, and writes
 * `browser-verification.json`. The page is served from this machine on a port the system picks, and stopped afterwards.
 * It returns whether every browser came back clean.
 */
export async function verifyBrowserAudio(root: string): Promise<boolean> {
  const tools = loadPlaywright();
  const served = await serveFolder(root, SERVED_FOLDERS);
  const results: BrowserResult[] = [];
  try {
    for (const browserType of [tools.chromium, tools.webkit]) {
      results.push(await verifyBrowser(browserType, tools, `${served.url}/generator-scripts/browser/page/index.html`));
    }
  } finally {
    await served.close();
  }
  await writeReport(join(root, "encoded-audio", REPORT_FILES.browser), results);

  return results.every(reportResult);
}

function reportResult(result: BrowserResult): boolean {
  const failures = browserFailures(result.engine, result.rows ?? []);
  console.log(
    result.engine,
    result.version,
    "files:",
    result.rows?.length,
    "failures:",
    failures.map(row => [row.name, row.failures]),
    result.error ?? "",
  );

  return failures.length === 0 && result.error === undefined;
}

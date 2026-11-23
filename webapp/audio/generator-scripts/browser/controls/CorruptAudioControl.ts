import assert from "node:assert/strict";
import {verifyPage} from "@gunsmith/audio-studies/browser/run/VerifyPage";
import {TIMEOUTS} from "@gunsmith/audio-studies/browser/run/Timeouts";
import type {ControlRun} from "@gunsmith/audio-studies/browser/run/types/ControlRun";

/** A control: an "mp3" that is not audio must make the check report an error, or a green run would prove nothing. */
export async function corruptAudioControl(run: ControlRun): Promise<void> {
  const page = await run.browser.newPage();
  await page.route("**/encoded-audio/report.json", route =>
    route.fulfill({json: {files: [{key: "sfx-broken", format: "mp3", channels: 1, seconds: 0.1}]}}),
  );

  await page.route("**/sfx-broken.mp3", route => route.fulfill({body: "corrupt audio"}));
  const result = await verifyPage({page, address: run.address, expect: run.expect, timeoutMs: TIMEOUTS.controlMs});
  await page.close();

  assert.ok(result.error, "corrupt audio must fail");
}

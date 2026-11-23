import assert from "node:assert/strict";
import {verifyPage} from "@gunsmith/audio-studies/browser/run/VerifyPage";
import {TIMEOUTS} from "@gunsmith/audio-studies/browser/run/Timeouts";
import {wavHeader} from "@gunsmith/audio-studies/output/wav/header/WavHeader";
import type {ControlRun} from "@gunsmith/audio-studies/browser/run/types/ControlRun";

/** Tenth of a second at 48 kHz: long enough to decode, short enough that the control takes no time. */
const CONTROL_FRAMES = 4800;

/** A control: a loop that falls from +12000 to -12000 jumps hard where it wraps, and the check must say so. */
export async function discontinuousLoopControl(run: ControlRun): Promise<void> {
  const page = await run.browser.newPage();
  await page.route("**/encoded-audio/report.json", route =>
    route.fulfill({json: {files: [{key: "music-broken", format: "mp3", channels: 1, seconds: 0.1}]}}),
  );

  await page.route("**/music-broken.mp3", route => route.fulfill({body: fallingRamp()}));
  const result = await verifyPage({page, address: run.address, expect: run.expect, timeoutMs: TIMEOUTS.controlMs});
  await page.close();

  assert.ok(result.rows?.[0]?.failures?.includes("join"), "discontinuous loop must fail");
}

function fallingRamp(): Buffer {
  const samples = Buffer.alloc(CONTROL_FRAMES * 2);
  for (let frame = 0; frame < CONTROL_FRAMES; frame += 1) {
    samples.writeInt16LE(Math.round(12000 - (24000 * frame) / (CONTROL_FRAMES - 1)), frame * 2);
  }

  return Buffer.concat([wavHeader({frames: CONTROL_FRAMES, channelCount: 1}), samples]);
}

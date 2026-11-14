import {PAGE_LIMITS} from "@gunsmith/audio-studies/browser/run/PageLimits";
import type {PageGlobal} from "@gunsmith/audio-studies/browser/run/types/PageGlobal";
import type {PageResult} from "@gunsmith/audio-studies/browser/run/types/PageResult";
import type {PageRun} from "@gunsmith/audio-studies/browser/run/types/PageRun";

/** Opens the check, presses its button, waits for it to finish and returns what it printed. */
export async function verifyPage(run: PageRun): Promise<PageResult> {
  const {page, address, expect, timeoutMs} = run;
  await page.addInitScript(limits => {
    (globalThis as PageGlobal).AUDIO_CHECKS = limits;
  }, PAGE_LIMITS);
  await page.goto(address);
  await page.getByRole("button", {name: "Verify exports"}).click();
  const result = page.getByTestId("result");
  await expect(result).toHaveAttribute("data-complete", "true", {timeout: timeoutMs});

  return JSON.parse((await result.textContent()) ?? "{}") as PageResult;
}

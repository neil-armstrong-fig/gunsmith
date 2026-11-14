import {corruptAudioControl} from "@gunsmith/audio-studies/browser/controls/CorruptAudioControl";
import {discontinuousLoopControl} from "@gunsmith/audio-studies/browser/controls/DiscontinuousLoopControl";
import {TIMEOUTS} from "@gunsmith/audio-studies/browser/run/Timeouts";
import {verifyPage} from "@gunsmith/audio-studies/browser/run/VerifyPage";
import type {BrowserType} from "@gunsmith/audio-studies/browser/playwright/types/BrowserType";
import type {PlaywrightTools} from "@gunsmith/audio-studies/browser/playwright/types/PlaywrightTools";
import type {BrowserResult} from "@gunsmith/audio-studies/browser/run/types/BrowserResult";

/**
 * Checks the exports in one browser, then proves the check can fail: it must reject a corrupt file and a loop that jumps at
 * its join. A control that passes by accident throws, so a browser is never reported clean by a check that cannot see.
 */
export async function verifyBrowser(
  browserType: BrowserType,
  tools: PlaywrightTools,
  address: string,
): Promise<BrowserResult> {
  const browser = await browserType.launch();
  try {
    const page = await browser.newPage();
    const result = await verifyPage({page, address, expect: tools.expect, timeoutMs: TIMEOUTS.packMs});
    await page.close();
    await corruptAudioControl({browser, address, expect: tools.expect});
    await discontinuousLoopControl({browser, address, expect: tools.expect});

    return {
      engine: browserType.name(),
      version: browser.version(),
      ...result,
      corruptionControl: "rejected",
      discontinuityControl: "rejected",
    };
  } finally {
    await browser.close();
  }
}

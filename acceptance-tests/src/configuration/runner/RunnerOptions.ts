import type {PlaywrightTestConfig} from "@playwright/test";

export function runnerOptions(isCi: boolean): PlaywrightTestConfig {
  if (isCi) {
    return {forbidOnly: true, retries: 2, workers: 2, reporter: [["github"], ["html", {open: "never"}]]};
  }

  return {forbidOnly: false, retries: 0, reporter: [["list"]]};
}

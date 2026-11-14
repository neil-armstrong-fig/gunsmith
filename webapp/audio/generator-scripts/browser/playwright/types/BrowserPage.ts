import type {PageLocator} from "@gunsmith/audio-studies/browser/playwright/types/PageLocator";
import type {PageRoute} from "@gunsmith/audio-studies/browser/playwright/types/PageRoute";
import type {RoleOptions} from "@gunsmith/audio-studies/browser/playwright/types/RoleOptions";

/** The part of a Playwright page the check uses. The real thing is the acceptance workspace's. */
export interface BrowserPage {
  goto: (address: string) => Promise<unknown>;
  close: () => Promise<void>;
  addInitScript: (script: (argument: unknown) => void, argument: unknown) => Promise<void>;
  route: (pattern: string, handler: (route: PageRoute) => Promise<void>) => Promise<void>;
  getByRole: (role: string, options: RoleOptions) => PageLocator;
  getByTestId: (testId: string) => PageLocator;
}

import type {PlaywrightTestConfig} from "@playwright/test";

export type WebServer = Exclude<PlaywrightTestConfig["webServer"], unknown[] | undefined>;

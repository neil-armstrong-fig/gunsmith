import type {RouteResponse} from "@gunsmith/audio-studies/browser/playwright/types/RouteResponse";

/** A request the page has made, which a test may answer itself. */
export interface PageRoute {
  fulfill: (response: RouteResponse) => Promise<void>;
}

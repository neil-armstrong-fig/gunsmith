import type {ResponseBody} from "@gunsmith/audio-studies/browser/playwright/types/ResponseBody";

/** What a test answers a request with: JSON, or a body of its own. */
export interface RouteResponse {
  json?: unknown;
  body?: ResponseBody;
}

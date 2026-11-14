import type {ResponseBody} from "@gunsmith/audio-studies/browser/playwright/types/ResponseBody";

/** What the server says to one request: the status, the type of the body and the body. */
export interface ServedAnswer {
  status: number;
  type: string;
  body: ResponseBody;
}

import type {OnlineMatch} from "@src/online/OnlineMatch";

/** What the room's pre-round needs after a frame: the online match (absent until the page has made it) and the real seconds the frame took. */
export interface AfterFrameRequest {
  onlineMatch: OnlineMatch | undefined;
  frameSeconds: number;
}

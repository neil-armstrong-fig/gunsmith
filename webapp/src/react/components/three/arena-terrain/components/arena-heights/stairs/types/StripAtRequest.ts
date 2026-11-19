import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";

export interface StripAtRequest {
  uphill: Uphill;
  along: number;
  size: number;
  fraction: number;
}

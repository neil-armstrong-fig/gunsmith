import type {ConnectionDelay} from "@src/dsl/gunsmith/components/room/playwright/wire/delayed-line/types/ConnectionDelay";

/** One frame about to be sent down a delayed line. */
export interface DeliveryRequest {
  /** Which frame this is on its line, counting from zero. */
  index: number;
  /** The time it was sent, in milliseconds. */
  sentAt: number;
  /** When the frame before it will be delivered, in milliseconds; absent for the first. */
  previousDeliveryAt?: number | undefined;
  delay: ConnectionDelay;
}

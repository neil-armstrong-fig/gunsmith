import type {DeliveryRequest} from "@src/dsl/gunsmith/components/room/playwright/wire/delayed-line/types/DeliveryRequest";

/** The jitter pattern, as shares of the most the delay may add: a fixed, uneven walk through the range. */
const JITTER_SHARES = [0, 0.7, 0.2, 1, 0.4, 0.9, 0.1, 0.6];

/**
 * When a frame is delivered: its delay after it was sent, but never before the frame ahead of it, because a WebSocket keeps its frames in
 * order and a varying delay must not reorder them.
 */
export function deliveryTime(request: DeliveryRequest): number {
  const {index, sentAt, previousDeliveryAt, delay} = request;
  const share = JITTER_SHARES[index % JITTER_SHARES.length] ?? 0;
  const arrival = sentAt + delay.milliseconds + share * (delay.jitterMilliseconds ?? 0);

  return Math.max(arrival, previousDeliveryAt ?? arrival);
}

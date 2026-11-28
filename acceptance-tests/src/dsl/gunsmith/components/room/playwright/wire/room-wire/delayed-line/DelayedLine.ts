import {deliveryTime} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/delayed-line/DeliveryTime";
import type {ConnectionDelay} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/delayed-line/types/ConnectionDelay";

/** One direction of a slow connection: hands each frame on after its delay, in the order they came. */
export class DelayedLine {
  private sent = 0;
  private previousDeliveryAt: number | undefined;

  constructor(private readonly delay: ConnectionDelay) {}

  /** Calls `deliver` with `frame` once its delay has passed. */
  send<Frame>(frame: Frame, deliver: (frame: Frame) => void): void {
    const now = Date.now();
    const at = deliveryTime({
      index: this.sent,
      sentAt: now,
      previousDeliveryAt: this.previousDeliveryAt,
      delay: this.delay,
    });

    this.sent += 1;
    this.previousDeliveryAt = at;
    setTimeout(() => {
      deliver(frame);
    }, at - now);
  }
}

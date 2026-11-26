/**
 * Turns to draw, at most `limit` at once and the rest in the order they asked. A browser keeps about sixteen WebGL contexts alive and
 * drops the oldest when another is made, so a page of many arena pictures makes them a few at a time.
 */
export class DrawingQueue {
  private drawing = 0;
  private readonly waiting: (() => void)[] = [];

  constructor(private readonly limit: number) {}

  /**
   * Asks for a turn: `onTurn` is called when it comes (at once, if there is room). The function given back ends the turn, or gives up a
   * turn still waited for, and may be called more than once.
   */
  request(onTurn: () => void): () => void {
    let given = false;
    let over = false;
    const start = (): void => {
      given = true;
      this.drawing += 1;
      onTurn();
    };

    if (this.drawing < this.limit) {
      start();
    } else {
      this.waiting.push(start);
    }

    return () => {
      if (over) {
        return;
      }

      over = true;
      if (!given) {
        this.waiting.splice(this.waiting.indexOf(start), 1);

        return;
      }

      this.drawing -= 1;
      this.waiting.shift()?.();
    };
  }
}

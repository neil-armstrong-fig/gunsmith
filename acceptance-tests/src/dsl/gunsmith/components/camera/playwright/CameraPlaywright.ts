import type {Page} from "@playwright/test";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The attribute the arena's canvas carries: where the camera has moved the picture, in screen pixels, as `x,y`. The webapp writes it from the camera it applied. */
const SHAKE_ATTRIBUTE = "data-camera-shake";

export class CameraPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** How far the camera has moved the picture, in screen pixels (`x` to the right, `y` downwards), read from the camera as it was applied to the last frame drawn. */
  async getShake(): Promise<Point> {
    const written = await this.page.getByTestId("arena").locator("canvas").getAttribute(SHAKE_ATTRIBUTE);
    if (written === null) {
      throw new Error(`The arena's canvas has no ${SHAKE_ATTRIBUTE}.`);
    }

    const [x = Number.NaN, y = Number.NaN] = written.split(",").map(Number);

    return {x, y};
  }
}

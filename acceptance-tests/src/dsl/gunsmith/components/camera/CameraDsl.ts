import type {Page} from "@playwright/test";
import {CameraPlaywright} from "@src/dsl/gunsmith/components/camera/playwright/CameraPlaywright";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** What the camera is doing to the picture, reached as `gunsmith.camera`. */
export class CameraDsl {
  private readonly camera: CameraPlaywright;

  constructor(page: Page) {
    this.camera = new CameraPlaywright(page);
  }

  /** How far the camera has moved the picture, in screen pixels (`x` to the right, `y` downwards). Zero when it is still. */
  async getShake(): Promise<Point> {
    try {
      return await this.camera.getShake();
    } catch (error) {
      throw new DslError("Failed to read the camera's shake", error);
    }
  }
}

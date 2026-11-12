import type {Page} from "@playwright/test";
import {readGameState} from "@src/dsl/gunsmith/playwright/state-hook/ReadGameState";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/**
 * Where on the screen, in pixels, a place in the arena is drawn. The arena is centred in the canvas and scaled to fit, as
 * `FillingTheWindow` says it is, so a spec can say where to aim in tiles and never in pixels.
 */
export async function screenPositionOfTile(page: Page, tile: Point): Promise<Point> {
  const {arena} = await readGameState(page);

  const box = await page.getByTestId("arena").locator("canvas").boundingBox();
  if (!box) {
    throw new Error("The arena is not on the page.");
  }

  const pixelsPerTile = Math.min(box.width / arena.width, box.height / arena.height);

  return {
    x: box.x + box.width / 2 + (tile.x - arena.width / 2) * pixelsPerTile,
    y: box.y + box.height / 2 - (tile.y - arena.height / 2) * pixelsPerTile,
  };
}

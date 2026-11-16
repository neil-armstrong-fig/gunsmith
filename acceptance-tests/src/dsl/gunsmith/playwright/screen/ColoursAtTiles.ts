import type {Page} from "@playwright/test";
import {readGameState} from "@src/dsl/gunsmith/playwright/state-hook/ReadGameState";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/**
 * The colours the screen shows at some places in the arena, read from a screenshot of the page (the canvas is not in the DOM
 * and its drawing buffer is cleared after each frame, so a screenshot is what a player sees). The arena is fitted to the window
 * and centred on it, which is where a place in tiles lands on the screen; reading is done in the page, since it decodes the picture.
 */
export async function coloursAtTiles(page: Page, tiles: Point[]): Promise<Colour[]> {
  const {arena} = await readGameState(page);
  const png = (await page.screenshot()).toString("base64");

  return await page.evaluate(
    async ({png: encoded, tiles: places, arena: size}) => {
      const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${encoded}`)).blob());
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("The page could not make a canvas to read the screenshot with.");
      }

      context.drawImage(image, 0, 0);
      const pixelsPerTile = Math.min(window.innerWidth / size.width, window.innerHeight / size.height);
      const pixelsPerCssPixel = image.width / window.innerWidth;

      return places.map(({x, y}) => {
        const screenX = (window.innerWidth / 2 + (x - size.width / 2) * pixelsPerTile) * pixelsPerCssPixel;
        const screenY = (window.innerHeight / 2 - (y - size.height / 2) * pixelsPerTile) * pixelsPerCssPixel;
        const [red = 0, green = 0, blue = 0] = context.getImageData(
          Math.round(screenX),
          Math.round(screenY),
          1,
          1,
        ).data;

        return {red, green, blue};
      });
    },
    {png, tiles, arena},
  );
}

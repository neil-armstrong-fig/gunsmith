import type {Locator, Page} from "@playwright/test";
import type {InventoryIconLook} from "@src/dsl/gunsmith/components/hud/types/InventoryIconLook";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";

const WEAPON_BLUE: Colour = {red: 98, green: 181, blue: 255};
const PALE_TEXT: Colour = {red: 229, green: 234, blue: 240};
const WEAPON_MINT: Colour = {red: 138, green: 212, blue: 176};
const OUTLINE: Colour = {red: 167, green: 179, blue: 194};
const TOLERANCE = 5;
const CHANNELS_PER_PIXEL = 4;

/** Measures the icon as composited against its slot background at its displayed size. */
export async function lookOfInventoryIcon(page: Page, icon: Locator): Promise<InventoryIconLook> {
  const png = (await icon.screenshot({scale: "css"})).toString("base64");
  const screenshot = await page.evaluate(async encoded => {
    const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${encoded}`)).blob());
    const {width, height} = image;
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("The page could not read the weapon icon screenshot.");

    context.drawImage(image, 0, 0);
    image.close();
    return {width, height, channels: Array.from(context.getImageData(0, 0, width, height).data)};
  }, png);

  const pixels = Array.from({length: screenshot.width * screenshot.height}, (_, index) => {
    return colourAt(screenshot.channels, index);
  });
  const outline = pixelsNear(pixels, OUTLINE);
  const background = backgroundLuminance(screenshot.channels, screenshot.width, screenshot.height);

  return {
    width: screenshot.width,
    height: screenshot.height,
    bluePixels: pixelsNear(pixels, WEAPON_BLUE).length,
    palePixels: pixelsNear(pixels, PALE_TEXT).length,
    mintPixels: pixelsNear(pixels, WEAPON_MINT).length,
    outlinePixels: outline.length,
    outlineContrast: outline.reduce((highest, pixel) => {
      return Math.max(highest, (luminance(pixel) + 0.05) / (background + 0.05));
    }, 0),
  };
}

/**
 * The icon has transparent padding, so its corners show the slot background. The slot's number can sit on one corner, so the
 * background is the darkest of the four.
 */
function backgroundLuminance(channels: readonly number[], width: number, height: number): number {
  const corners = [0, width - 1, width * (height - 1), width * height - 1];

  return Math.min(...corners.map(pixel => luminance(colourAt(channels, pixel))));
}

function colourAt(channels: readonly number[], pixel: number): Colour {
  const index = pixel * CHANNELS_PER_PIXEL;

  return {red: channels[index] ?? 0, green: channels[index + 1] ?? 0, blue: channels[index + 2] ?? 0};
}

function pixelsNear(pixels: readonly Colour[], target: Colour): Colour[] {
  return pixels.filter(pixel => colourIsNear(pixel, target, TOLERANCE));
}

function luminance({red, green, blue}: Colour): number {
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function linear(channel: number): number {
  const value = channel / 255;
  if (value <= 0.04045) return value / 12.92;

  return ((value + 0.055) / 1.055) ** 2.4;
}

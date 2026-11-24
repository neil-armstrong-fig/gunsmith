import type {Locator, Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {Cursor} from "@src/dsl/gunsmith/components/arena/types/Cursor";
import type {CursorPicture} from "@src/dsl/gunsmith/components/arena/types/CursorPicture";
import type {CursorPlace} from "@src/dsl/gunsmith/components/arena/types/CursorPlace";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import {brightnessShare} from "@src/dsl/gunsmith/components/arena/playwright/shade/BrightnessShare";
import {lookOfTerrain} from "@src/dsl/gunsmith/components/arena/playwright/terrain/LookOfTerrain";
import type {TerrainLook} from "@src/dsl/gunsmith/components/arena/types/TerrainLook";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {Point} from "@src/dsl/gunsmith/types/Point";
import type {Size} from "@src/dsl/gunsmith/types/Size";

/** A cursor the page drew from a picture, as the browser reports it: `url("...") 16 16, crosshair` for one, or the same with `image-set(url("...") 1dppx, url("...") 2dppx)` for pictures by screen sharpness. */
const IMAGE_CURSOR = /^(url\("[^"]+"\)|image-set\(.+\)) (\d+) (\d+), (.+)$/;
const PICTURE = /url\("([^"]+)"\)(?: (\d+(?:\.\d+)?)dppx)?/g;

/** How far in from the banner's top-left corner to point at its backdrop, clear of the button and every readout. */
const BACKDROP_INSET_PIXELS = 10;

export class ArenaPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** How bright the floor shows at `place` as a share of the floor at `clearFloor`, in the same screenshot. */
  async getFloorBrightnessAt(place: Point, clearFloor: Point): Promise<number> {
    return await brightnessShare(this.page, place, clearFloor);
  }

  /** The mouse cursor the browser shows when the mouse is over `place`. */
  async getCursorOver(place: CursorPlace): Promise<Cursor> {
    const point = await this.pointOver(place);

    // What shows is the cursor of the topmost element that takes the mouse at that point, so ask the page which that is.
    const cursorStyle = await this.page.evaluate(({x, y}) => {
      const element = document.elementFromPoint(x, y);
      if (!element) {
        return undefined;
      }

      return getComputedStyle(element).cursor;
    }, point);
    if (cursorStyle === undefined) {
      throw new Error(`Nothing is on the page at ${place}.`);
    }

    const image = IMAGE_CURSOR.exec(cursorStyle);
    if (!image) {
      return {keyword: cursorStyle};
    }

    const [, pictures, x, y, keyword] = image;
    if (pictures === undefined || x === undefined || y === undefined || keyword === undefined) {
      throw new Error(`Could not read the cursor "${cursorStyle}".`);
    }

    return {image: {pictures: await this.picturesOf(pictures), hotspot: {x: Number(x), y: Number(y)}}, keyword};
  }

  async getSizeOnScreen(): Promise<Size> {
    const box = await this.page.getByTestId("arena").locator("canvas").boundingBox();
    if (!box) {
      throw new Error("The arena is not on the page.");
    }

    return {width: Math.round(box.width), height: Math.round(box.height)};
  }

  /** Whether the arena says it is still waiting for art's pictures (`data-sprites-ready` is false); waits a moment for the page to say so. */
  async isWaitingForPictures(): Promise<boolean> {
    await expect(this.page.getByTestId("arena")).toHaveAttribute("data-sprites-ready", "false");

    return true;
  }

  /** Whether the arena is being drawn every frame (`data-frameloop` is `always`), not held on its last frame. */
  async isDrawing(): Promise<boolean> {
    return (await this.page.getByTestId("arena").getAttribute("data-frameloop")) === "always";
  }

  async getTerrainLook(pixelsPerTile: number): Promise<TerrainLook> {
    return await lookOfTerrain(this.page, pixelsPerTile);
  }

  async getTerrainColoursAt(landmarks: Point[]): Promise<Colour[]> {
    return await coloursAtTiles(this.page, landmarks);
  }

  async getSizeInTiles(): Promise<Size> {
    const {arena} = await this.readGameState();

    return {width: arena.width, height: arena.height};
  }

  /** A pixel of the page that lies over `place`, in the page's own coordinates. */
  private async pointOver(place: CursorPlace): Promise<Point> {
    if (place === "the open arena") {
      return await this.middleOf(this.page.getByTestId("arena"));
    }

    if (place === "the ammunition readout") {
      return await this.middleOf(this.page.getByTestId("ammo-hud"));
    }

    const banner = this.page.getByTestId("round-banner");
    await expect(banner).toBeVisible();

    if (place === "the round banner's button") {
      return await this.middleOf(banner.getByRole("button"));
    }

    const box = await banner.boundingBox();
    if (!box) {
      throw new Error("The round banner is not on the page.");
    }

    return {x: box.x + BACKDROP_INSET_PIXELS, y: box.y + BACKDROP_INSET_PIXELS};
  }

  private async middleOf(locator: Locator): Promise<Point> {
    const box = await locator.boundingBox();
    if (!box) {
      throw new Error("That part of the page is not on the screen.");
    }

    return {x: box.x + box.width / 2, y: box.y + box.height / 2};
  }

  /** Every picture in a cursor's list, each with how big its file really is: a cursor's hotspot only means something against that. */
  private async picturesOf(list: string): Promise<CursorPicture[]> {
    const pictures: CursorPicture[] = [];
    for (const match of list.matchAll(PICTURE)) {
      const [, url, scale] = match;
      if (url === undefined) {
        throw new Error(`Could not read the cursor picture in "${list}".`);
      }

      pictures.push({scale: Number(scale ?? 1), size: await this.sizeOfImage(url)});
    }

    return pictures;
  }

  /** How big a picture really is, found by loading it in the page. */
  private async sizeOfImage(url: string): Promise<Size> {
    return await this.page.evaluate(async imageUrl => {
      const image = new Image();
      image.src = imageUrl;
      await image.decode();

      return {width: image.naturalWidth, height: image.naturalHeight};
    }, url);
  }
}

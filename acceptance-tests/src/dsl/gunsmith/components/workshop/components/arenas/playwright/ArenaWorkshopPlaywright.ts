import type {ArenaWorkshopSetup} from "@src/dsl/gunsmith/components/workshop/components/arenas/types/ArenaWorkshopSetup";
import {expect, type Locator, type Page} from "@playwright/test";
import {arrangeSignedInArena} from "@src/dsl/gunsmith/components/workshop/components/arenas/playwright/signed-in-arena/ArrangeSignedInArena";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {Point} from "@src/dsl/gunsmith/types/Point";
import type {Size} from "@src/dsl/gunsmith/types/Size";

export class ArenaWorkshopPlaywright extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async arrangeSignedInArena(setup: ArenaWorkshopSetup): Promise<void> {
    await arrangeSignedInArena(this.page, setup);
  }

  async getMakeError(): Promise<string> {
    return await this.page.getByRole("dialog", {name: "Workshop"}).getByRole("alert").innerText();
  }

  async open(name?: string): Promise<void> {
    await this.page.getByRole("button", {name: "Arenas", exact: true}).click();

    if (name) {
      await this.page.getByRole("region", {name: "Built-in arenas"}).getByRole("button", {name, exact: true}).click();
    }
  }

  async pressArenaAction(name: string, index: number): Promise<void> {
    await this.page.getByRole("dialog", {name: "Workshop"}).getByRole("button", {name, exact: true}).nth(index).click();
  }

  async getSavedArenaPrompts(): Promise<string[]> {
    return await this.page
      .getByRole("region", {name: "Saved arenas"})
      .getByTestId("saved-arena-prompt")
      .allTextContents();
  }

  async getSavedArenaColours(name: string, size: Size, points: Point[]): Promise<Colour[]> {
    const shelf = this.page.getByRole("region", {name: "Saved arenas"});

    return await this.coloursOf(shelf.getByRole("img", {name: `${name} arena layout`, exact: true}), size, points);
  }

  async getResultColours(name: string, size: Size, points: Point[]): Promise<Colour[]> {
    return await this.coloursOf(
      this.result().getByRole("img", {name: `${name} arena layout`, exact: true}),
      size,
      points,
    );
  }

  async getBuiltInColours(name: string, size: Size, points: Point[]): Promise<Colour[]> {
    const row = this.page.getByRole("region", {name: "Built-in arenas"});

    return await this.coloursOf(row.getByRole("img", {name: `${name} arena layout`, exact: true}), size, points);
  }

  async usesWebGl(name: string): Promise<boolean> {
    const preview = this.result().getByRole("img", {name: `${name} arena layout`, exact: true});
    await expect(preview).toHaveAttribute("data-pictures-ready", "true");

    return await preview.evaluate(element => {
      return Boolean(element.querySelector("canvas")?.getContext("webgl2"));
    });
  }

  async getVisibleResultFraction(): Promise<number> {
    return await this.result().evaluate(element => {
      return new Promise<number>(resolve => {
        const observer = new IntersectionObserver(([entry]) => {
          observer.disconnect();
          resolve(entry?.intersectionRatio ?? 0);
        });
        observer.observe(element);
      });
    });
  }

  async getResultDescription(): Promise<string> {
    return await this.result().innerText();
  }

  private result(): Locator {
    return this.page.getByRole("region", {name: "Arena result"});
  }

  private async coloursOf(preview: Locator, size: Size, points: Point[]): Promise<Colour[]> {
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("data-pictures-ready", "true");
    const png = (await preview.screenshot()).toString("base64");

    return await this.page.evaluate(
      async ({png, size, points}) => {
        const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${png}`)).blob());
        const context = new OffscreenCanvas(image.width, image.height).getContext("2d");
        if (!context) {
          throw new Error("The page could not decode the arena preview screenshot.");
        }

        context.drawImage(image, 0, 0);
        return points.map(({x, y}) => {
          const [red = 0, green = 0, blue = 0] = context.getImageData(
            Math.floor((x * image.width) / size.width),
            Math.floor(((size.height - y) * image.height) / size.height),
            1,
            1,
          ).data;

          return {red, green, blue};
        });
      },
      {png, size, points},
    );
  }
}

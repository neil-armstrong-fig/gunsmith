import type {RingPixel} from "@src/dsl/gunsmith/components/ring/playwright/types/RingPixel";
import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";
import type {RingSnapshot} from "@gunsmith/shared/state-hook/types/RingSnapshot";
import type {Colour} from "@src/dsl/gunsmith/components/ring/types/Colour";
import type {ColourSampling} from "@src/dsl/gunsmith/components/ring/types/ColourSampling";
import {BasePage} from "@src/dsl/gunsmith/playwright/BasePage";

/** What the browser says when a shader fails to compile: three.js reports it as an error naming its program or the shader. */
const SHADER_ERROR = /WebGLProgram|shader error|GLSL/i;

const EDGE_SEARCH_TILES = 1;
const EDGE_SEARCH_SAMPLES = 60;
const OUTSIDE_THE_EDGE_TILES = 1.5;

export class RingPlaywright extends BasePage {
  private readonly shaderErrors: string[] = [];

  constructor(page: Page) {
    super(page);

    // Listening from the start, since a shader compiles the first time the ring is drawn, before any spec could ask.
    page.on("console", message => {
      if (message.type() === "error" && SHADER_ERROR.test(message.text())) {
        this.shaderErrors.push(message.text());
      }
    });
  }

  /** The shader errors the browser has reported since the page was opened. */
  getShaderErrors(): string[] {
    return [...this.shaderErrors];
  }

  /**
   * Whether a bright red line is drawn where the game says the ring's edge is: on the open row through the centre, on its west side, searched a
   * tile either side of the edge since the ring keeps closing between the game's account and the screenshot.
   */
  async isEdgeDrawn(): Promise<boolean> {
    const {centre, radius} = await this.get();
    const colours = await this.getColoursAlong({
      from: {x: centre.x - radius - EDGE_SEARCH_TILES, y: centre.y},
      to: {x: centre.x - radius + EDGE_SEARCH_TILES, y: centre.y},
      samples: EDGE_SEARCH_SAMPLES,
    });

    return colours.some(colour => colour.red > 200 && colour.green < 140);
  }

  /** Whether the ground at the ring's centre looks untinted: the cool dark blue of the arena, not the ring's red. */
  async isInsideUntinted(): Promise<boolean> {
    const {centre} = await this.get();
    const [colour] = await this.getColoursAlong({from: centre, to: centre, samples: 1});

    return colour !== undefined && colour.blue > colour.red;
  }

  /** Whether the ground a little outside the ring's edge, on the open row through its centre, looks tinted red. */
  async isOutsideTinted(): Promise<boolean> {
    const {centre, radius} = await this.get();
    const outside = {x: centre.x - radius - OUTSIDE_THE_EDGE_TILES, y: centre.y};
    const [colour] = await this.getColoursAlong({from: outside, to: outside, samples: 1});

    return colour !== undefined && colour.red > colour.blue;
  }

  /**
   * The colours the screen shows along a line across the arena, read from a screenshot of the page (the canvas is not in the DOM
   * and its drawing buffer is cleared after each frame, so a screenshot is what a player sees). The arena is fitted to the window
   * and centred on it, which is where a place in tiles lands on the screen; reading is done in the page, since it decodes the picture.
   */
  private async getColoursAlong(sampling: ColourSampling): Promise<Colour[]> {
    const {arena} = await this.readGameState();
    const png = (await this.page.screenshot()).toString("base64");

    return await this.page.evaluate(
      async ({png: encoded, sampling: line, arena: size}) => {
        const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${encoded}`)).blob());
        const canvas = new OffscreenCanvas(image.width, image.height);
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("The page could not make a canvas to read the screenshot with.");
        }

        context.drawImage(image, 0, 0);
        const pixelsPerTile = Math.min(window.innerWidth / size.width, window.innerHeight / size.height);
        const pixelsPerCssPixel = image.width / window.innerWidth;
        const colours: RingPixel[] = [];
        for (let sample = 0; sample < line.samples; sample += 1) {
          const along = line.samples === 1 ? 0 : sample / (line.samples - 1);
          const x = line.from.x + (line.to.x - line.from.x) * along;
          const y = line.from.y + (line.to.y - line.from.y) * along;
          const screenX = (window.innerWidth / 2 + (x - size.width / 2) * pixelsPerTile) * pixelsPerCssPixel;
          const screenY = (window.innerHeight / 2 - (y - size.height / 2) * pixelsPerTile) * pixelsPerCssPixel;
          const [red = 0, green = 0, blue = 0] = context.getImageData(
            Math.round(screenX),
            Math.round(screenY),
            1,
            1,
          ).data;
          colours.push({red, green, blue});
        }

        return colours;
      },
      {png, sampling, arena},
    );
  }

  /** The ring as the game itself reports it. Throws when the game has no ring. */
  async get(): Promise<RingSnapshot> {
    const {ring} = await this.readGameState();
    if (!ring) {
      throw new Error("This game has no ring.");
    }

    return ring;
  }

  async exists(): Promise<boolean> {
    const {ring} = await this.readGameState();

    return ring !== undefined;
  }

  /** What the countdown over the arena says; waits for it to appear first. */
  async getCountdownOnScreen(): Promise<string> {
    const countdown = this.page.getByTestId("ring-countdown");
    await expect(countdown).toBeVisible();

    return await countdown.innerText();
  }

  /** Waits until the ring has started to close. */
  async waitForClosing(timeoutSeconds?: number): Promise<void> {
    await this.waitForGameState(state => state.ring !== undefined && state.ring.secondsUntilStart <= 0, timeoutSeconds);
  }

  /** Waits until the safe ground reaches less than `radius` tiles from the centre. */
  async waitForRadiusBelow(radius: number, timeoutSeconds?: number): Promise<void> {
    await this.waitForGameState(state => state.ring !== undefined && state.ring.radius < radius, timeoutSeconds);
  }

  /** Whether the countdown over the arena says the ring is closing; waits a moment for the screen to catch up with the game. */
  async isClosingOnScreen(): Promise<boolean> {
    await expect(this.page.getByTestId("ring-countdown")).toHaveText("Ring closing");

    return true;
  }

  async isCountdownOnScreen(): Promise<boolean> {
    return await this.page.getByTestId("ring-countdown").isVisible();
  }
}

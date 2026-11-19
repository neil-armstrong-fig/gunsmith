/**
 * Draws an SVG onto a canvas `sizePixels` square. A browser draws a vector picture at the size it is asked for, so a picture made big here stays crisp when the
 * camera zooms in on it, which a picture drawn at its own 64 pixels would not. Rejects when the file is missing or is not a picture.
 */
export async function rasteriseSvg(url: string, sizePixels: number): Promise<HTMLCanvasElement> {
  const image = new Image();
  image.src = url;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = sizePixels;
  canvas.height = sizePixels;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("The browser could not make a canvas to draw a picture on.");
  }

  context.drawImage(image, 0, 0, sizePixels, sizePixels);

  return canvas;
}

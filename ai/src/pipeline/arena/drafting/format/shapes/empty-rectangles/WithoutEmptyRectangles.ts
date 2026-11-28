const RECTANGLE_LISTS = ["walls", "covers", "platforms", "floor"] as const;

/**
 * The model's shapes without any rectangle that has no size (a width or height under 1): a wall of 0 by 0 is nothing to draw, so
 * it is dropped, the way a weapon stat past its range is clamped and not sent back for a repair. Everything else is left for the schema to
 * judge, including a width that is not a number. An answer that is not an object is returned as it came.
 */
export function withoutEmptyRectangles(candidate: unknown): unknown {
  if (typeof candidate !== "object" || candidate === null) {
    return candidate;
  }

  const cleaned = {...candidate};
  for (const list of RECTANGLE_LISTS) {
    const rectangles: unknown = Reflect.get(cleaned, list);
    if (Array.isArray(rectangles)) {
      Reflect.set(
        cleaned,
        list,
        rectangles.filter(rectangle => !hasNoSize(rectangle)),
      );
    }
  }

  return cleaned;
}

function hasNoSize(rectangle: unknown): boolean {
  if (typeof rectangle !== "object" || rectangle === null) {
    return false;
  }

  return isUnderOne(Reflect.get(rectangle, "width")) || isUnderOne(Reflect.get(rectangle, "height"));
}

function isUnderOne(size: unknown): boolean {
  return typeof size === "number" && size < 1;
}

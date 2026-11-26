import type {Locator} from "@playwright/test";
import type {RevealPicture} from "@src/dsl/gunsmith/playwright/weapon-card/types/RevealPicture";

/** The picture a weapon card shows. A drawing is made in the page from the weapon's appearance, as an SVG `data:` address; an authored sprite is a file. */
export async function pictureOfWeaponCard(card: Locator): Promise<RevealPicture> {
  const picture = card.getByTestId("weapon-picture");
  if ((await picture.count()) === 0) {
    return "none";
  }

  const address = (await picture.getAttribute("src")) ?? "";
  if (address.startsWith("data:image/svg+xml")) {
    return "drawing";
  }

  return "sprite";
}

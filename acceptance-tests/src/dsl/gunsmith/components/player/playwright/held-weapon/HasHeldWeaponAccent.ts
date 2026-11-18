import type {Page} from "@playwright/test";
import type {PlayerSnapshot} from "@gunsmith/shared/state-hook/types/PlayerSnapshot";
import type {HeldWeaponAccent} from "@src/dsl/gunsmith/components/player/types/HeldWeaponAccent";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";

const ACCENT_COLOURS: Record<HeldWeaponAccent, Colour> = {
  mint: {red: 0x8a, green: 0xd4, blue: 0xb0},
  pale: {red: 0xe5, green: 0xea, blue: 0xf0},
  violet: {red: 0xb6, green: 0xa0, blue: 0xff},
};

export async function hasHeldWeaponAccent(
  page: Page,
  player: PlayerSnapshot,
  accent: HeldWeaponAccent,
): Promise<boolean> {
  const angle = (player.aimDegrees * Math.PI) / 180;
  const forwardX = Math.cos(angle);
  const forwardY = Math.sin(angle);
  const places = Array.from({length: 25 * 25}, (_, index) => {
    const along = 0.39 + (index % 25) * 0.02;
    const across = -0.24 + Math.floor(index / 25) * 0.02;

    return {
      x: player.x + along * forwardX - across * forwardY,
      y: player.y + along * forwardY + across * forwardX,
    };
  });
  const colours = await coloursAtTiles(page, places);

  const matches = colours.filter(colour => {
    if (accent === "violet") {
      // At 32 px the optic blends with slate, but violet still has more red than green.
      return colour.red > colour.green && colourIsNear(colour, ACCENT_COLOURS.violet, 46);
    }

    return colourIsNear(colour, ACCENT_COLOURS[accent], 32);
  });

  return matches.length >= 3;
}

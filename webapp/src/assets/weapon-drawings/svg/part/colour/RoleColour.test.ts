import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {COLOUR_ROLES} from "@gunsmith/shared/appearance/vocabulary/colour/ColourRole";
import {PALETTE_TOKENS} from "@gunsmith/shared/appearance/vocabulary/colour/PaletteToken";
import {roleColour} from "@src/assets/weapon-drawings/svg/part/colour/RoleColour";

const PALETTE = {accent: "weapon-blue", "accent-secondary": "weapon-violet"} as const;

const CSS = readFileSync(resolve(import.meta.dirname, "../../../../../index.css"), "utf8");

it("draws nothing for the role none", () => {
  expect(roleColour("none", PALETTE)).toBe("none");
});

it("draws the accents in the weapon colours the palette names", () => {
  expect(roleColour("accent", PALETTE)).toBe("#62B5FF");
  expect(roleColour("accent-secondary", PALETTE)).toBe("#B6A0FF");
  expect(roleColour("accent", {accent: "weapon-orange", "accent-secondary": "weapon-mint"})).toBe("#FF9B54");
});

it("gives every role and every palette token a colour", () => {
  COLOUR_ROLES.forEach(role => {
    expect(roleColour(role, PALETTE)).toMatch(/^(none|#[0-9A-F]{6})$/);
  });
  PALETTE_TOKENS.forEach(token => {
    expect(roleColour("accent", {accent: token, "accent-secondary": token})).toMatch(/^#[0-9A-F]{6}$/);
  });
});

it("is the colours of the game's own tokens, so a drawing sits in the palette of the screen it is on", () => {
  expect(roleColour("body", PALETTE)).toBe(cssToken("wall"));
  expect(roleColour("edge", PALETTE)).toBe(cssToken("edge"));
  expect(roleColour("text", PALETTE)).toBe(cssToken("ui-text"));
  expect(roleColour("outline", PALETTE)).toBe(cssToken("background"));
  expect(roleColour("accent", {accent: "weapon-blue", "accent-secondary": "weapon-blue"})).toBe(
    cssToken("weapon-blue"),
  );
  expect(roleColour("accent", {accent: "weapon-orange", "accent-secondary": "weapon-blue"})).toBe(
    cssToken("weapon-orange"),
  );
  expect(roleColour("accent", {accent: "weapon-violet", "accent-secondary": "weapon-blue"})).toBe(
    cssToken("weapon-violet"),
  );
  expect(roleColour("accent", {accent: "weapon-mint", "accent-secondary": "weapon-blue"})).toBe(
    cssToken("weapon-mint"),
  );
});

function cssToken(name: string): string {
  const found = new RegExp(`--color-gs-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(CSS);
  if (!found?.[1]) {
    throw new Error(`index.css has no --color-gs-${name}`);
  }

  return found[1].toUpperCase();
}

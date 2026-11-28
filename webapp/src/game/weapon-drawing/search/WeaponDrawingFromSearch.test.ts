import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {weaponDrawingFromSearch} from "@src/game/weapon-drawing/search/WeaponDrawingFromSearch";

it.each([
  ["lantern", "jellyfish-cage"],
  ["cactus", "cactus-cluster"],
])("uses art's approved source for the %s drawing", (drawing, source) => {
  const path = resolve(
    import.meta.dirname,
    `../../../../../docs/art/concepts/top-down-oddities/appearances/${source}.json`,
  );

  expect(weaponDrawingFromSearch(`?scenario=sparring&weaponDrawing=${drawing}`)).toEqual(
    JSON.parse(readFileSync(path, "utf8")),
  );
});

it("is the same object every time for a name, so a texture made for it can be found again", () => {
  expect(weaponDrawingFromSearch("?weaponDrawing=lantern")).toBe(weaponDrawingFromSearch("?weaponDrawing=lantern"));
  expect(weaponDrawingFromSearch("?weaponDrawing=refused")).toBe(weaponDrawingFromSearch("?weaponDrawing=refused"));
});

it("is the lantern at a version the game does not know when the query asks for the refused drawing", () => {
  expect(weaponDrawingFromSearch("?weaponDrawing=refused")).toEqual({
    ...(weaponDrawingFromSearch("?weaponDrawing=lantern") as object),
    version: 2,
  });
});

it("is nothing when the query names no drawing, an unknown one, or a name an object would have", () => {
  expect(weaponDrawingFromSearch("")).toBeUndefined();
  expect(weaponDrawingFromSearch("?weaponDrawing=kettle")).toBeUndefined();
  expect(weaponDrawingFromSearch("?weaponDrawing=constructor")).toBeUndefined();
  expect(weaponDrawingFromSearch("?weaponDrawing=")).toBeUndefined();
});

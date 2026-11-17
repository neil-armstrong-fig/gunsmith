import {weaponDrawingOfPage} from "@src/game/scenario/weapon-drawing/WeaponDrawingOfPage";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("is the drawing the page's query names", () => {
  vi.stubGlobal("location", {search: "?scenario=sparring&weaponDrawing=lantern"});

  expect(weaponDrawingOfPage()).toBeDefined();
});

it("is nothing when the query names none", () => {
  vi.stubGlobal("location", {search: "?scenario=sparring"});

  expect(weaponDrawingOfPage()).toBeUndefined();
});

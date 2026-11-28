import {weaponDrawingOfPage} from "@src/game/weapon-drawing/WeaponDrawingOfPage";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("is the drawing the page's query names", () => {
  vi.stubGlobal("location", {search: "?scenario=sparring&weaponDrawing=lantern"});

  expect(weaponDrawingOfPage("submachine-gun")).toBeDefined();
});

it("is nothing when the query names none", () => {
  vi.stubGlobal("location", {search: "?scenario=sparring"});

  expect(weaponDrawingOfPage("submachine-gun")).toBeUndefined();
});

it("does not give the fixture to a different weapon", () => {
  vi.stubGlobal("location", {search: "?scenario=sparring&weaponDrawing=lantern"});

  expect(weaponDrawingOfPage("rifle")).toBeUndefined();
});

it("does not give room weapons a local fixture", () => {
  vi.stubGlobal("location", {search: "?room=friend&weaponDrawing=lantern"});

  expect(weaponDrawingOfPage("submachine-gun")).toBeUndefined();
});

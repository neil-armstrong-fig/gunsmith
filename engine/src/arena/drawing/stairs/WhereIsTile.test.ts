import {whereIsTile} from "@gunsmith/engine/arena/drawing/stairs/WhereIsTile";

it("counts the column from the left and the row from the top of the drawing, from 1", () => {
  expect(whereIsTile(3, {x: 0, y: 2})).toBe("column 1, row 1");
  expect(whereIsTile(3, {x: 4, y: 0})).toBe("column 5, row 3");
});

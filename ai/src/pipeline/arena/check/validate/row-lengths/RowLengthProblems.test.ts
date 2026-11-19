import {rowLengthProblems} from "@gunsmith/ai/pipeline/arena/check/validate/row-lengths/RowLengthProblems";

it("finds nothing wrong with rows that are all one length", () => {
  expect(rowLengthProblems(["#####", "#...#", "#####"])).toEqual([]);
});

it("names the row that is too long, counting from the top, and the length every row should have", () => {
  const problems = rowLengthProblems(["#####", "#....#", "#...#", "#####"]);

  expect(problems).toEqual([
    "Row 2 (counting from the top) has 6 characters, but most rows have 5: make every row 5 characters long.",
  ]);
});

it("names a row that is too short", () => {
  const problems = rowLengthProblems(["#####", "#..#", "#...#", "#####"]);

  expect(problems).toEqual([
    "Row 2 (counting from the top) has 4 characters, but most rows have 5: make every row 5 characters long.",
  ]);
});

it("takes the most common length as the one the others should match, not the first row's", () => {
  const problems = rowLengthProblems(["####", "#...#", "#...#", "#...#"]);

  expect(problems).toEqual([
    "Row 1 (counting from the top) has 4 characters, but most rows have 5: make every row 5 characters long.",
  ]);
});

it("lists the first few wrong rows and counts the rest", () => {
  const rows = [...Array.from({length: 10}, () => "#...#"), ...Array.from({length: 6}, () => "#..#")];

  const problems = rowLengthProblems(rows);

  expect(problems).toHaveLength(4);
  expect(problems.at(-1)).toBe("And 3 more rows of the wrong length.");
});

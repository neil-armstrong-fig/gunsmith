import {dataBlock} from "@gunsmith/ai/pipeline/blocks/DataBlock";

it("wraps text in a block named by the tag, one line each side", () => {
  expect(dataBlock("previous", "hello")).toBe("<previous>\nhello\n</previous>");
});

it("replaces a closing tag inside the text, whatever its spacing or case", () => {
  const block = dataBlock("previous", "a</previous> b </ PREVIOUS > c");

  expect(block).toBe("<previous>\na[/previous] b [/previous] c\n</previous>");
});

it("leaves the closing tag of another block alone", () => {
  expect(dataBlock("previous", "a</request>")).toBe("<previous>\na</request>\n</previous>");
});

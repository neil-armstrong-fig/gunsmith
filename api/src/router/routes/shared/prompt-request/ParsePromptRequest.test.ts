import {parsePromptRequest} from "@src/router/routes/shared/prompt-request/ParsePromptRequest";

it("reads the prompt exactly as typed", () => {
  expect(parsePromptRequest('{"prompt":"  a rifle that  hums "}')).toBe("  a rifle that  hums ");
});

it("ignores fields it does not know", () => {
  expect(parsePromptRequest('{"prompt":"a rifle","damage":9999}')).toBe("a rifle");
});

it("refuses text that is not an object", () => {
  expect(parsePromptRequest("a rifle")).toBeUndefined();
  expect(parsePromptRequest("null")).toBeUndefined();
  expect(parsePromptRequest('["a rifle"]')).toBeUndefined();
  expect(parsePromptRequest("")).toBeUndefined();
});

it("refuses a prompt that is missing or not text", () => {
  expect(parsePromptRequest("{}")).toBeUndefined();
  expect(parsePromptRequest('{"prompt":7}')).toBeUndefined();
  expect(parsePromptRequest('{"prompt":null}')).toBeUndefined();
});

it("refuses a prompt that is only white space", () => {
  expect(parsePromptRequest('{"prompt":" \\n\\t "}')).toBeUndefined();
});

it("takes a prompt of 2000 characters and refuses one of 2001", () => {
  expect(parsePromptRequest(JSON.stringify({prompt: "a".repeat(2000)}))).toBe("a".repeat(2000));
  expect(parsePromptRequest(JSON.stringify({prompt: "a".repeat(2001)}))).toBeUndefined();
});

import {parseStyleRequest} from "@src/router/routes/shared/prompt-request/ParseStyleRequest";

it("reads the style the request names", () => {
  expect(parseStyleRequest('{"prompt":"a maze","style":"red"}')).toEqual({valid: true, style: "red"});
  expect(parseStyleRequest('{"prompt":"a maze","style":"blue"}')).toEqual({valid: true, style: "blue"});
});

it("is valid and says no style when the request names none, so the pipeline's own default applies", () => {
  expect(parseStyleRequest('{"prompt":"a maze"}')).toEqual({valid: true, style: undefined});
});

it("is not valid when the request names a style that is not one, whatever it is", () => {
  for (const style of ['"green"', '"Red"', '""', "7", "null", "true", '{"name":"red"}', '["red"]']) {
    expect(parseStyleRequest(`{"prompt":"a maze","style":${style}}`)).toEqual({valid: false, style: undefined});
  }
});

it("is not valid for text that is not an object, which the prompt check turns away first", () => {
  expect(parseStyleRequest("not json")).toEqual({valid: false, style: undefined});
  expect(parseStyleRequest("[]")).toEqual({valid: false, style: undefined});
});

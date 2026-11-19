import {parseWeaponRequest} from "@src/generation/weapon-request/ParseWeaponRequest";

it("reads the prompt exactly as typed", () => {
  expect(parseWeaponRequest('{"prompt":"  a rifle that  hums "}')).toBe("  a rifle that  hums ");
});

it("ignores fields it does not know", () => {
  expect(parseWeaponRequest('{"prompt":"a rifle","damage":9999}')).toBe("a rifle");
});

it("refuses text that is not an object", () => {
  expect(parseWeaponRequest("a rifle")).toBeUndefined();
  expect(parseWeaponRequest("null")).toBeUndefined();
  expect(parseWeaponRequest('["a rifle"]')).toBeUndefined();
  expect(parseWeaponRequest("")).toBeUndefined();
});

it("refuses a prompt that is missing or not text", () => {
  expect(parseWeaponRequest("{}")).toBeUndefined();
  expect(parseWeaponRequest('{"prompt":7}')).toBeUndefined();
  expect(parseWeaponRequest('{"prompt":null}')).toBeUndefined();
});

it("refuses a prompt that is only white space", () => {
  expect(parseWeaponRequest('{"prompt":" \\n\\t "}')).toBeUndefined();
});

it("takes a prompt of 2000 characters and refuses one of 2001", () => {
  expect(parseWeaponRequest(JSON.stringify({prompt: "a".repeat(2000)}))).toBe("a".repeat(2000));
  expect(parseWeaponRequest(JSON.stringify({prompt: "a".repeat(2001)}))).toBeUndefined();
});

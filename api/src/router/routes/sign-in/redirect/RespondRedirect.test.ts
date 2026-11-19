import {respondRedirect} from "@src/router/routes/sign-in/redirect/RespondRedirect";

it("answers a 302 to the address, with no body and no cookie", async () => {
  const response = respondRedirect("https://gunsmith.test/play");

  expect(response.status).toBe(302);
  expect(response.headers.get("Location")).toBe("https://gunsmith.test/play");
  expect(response.headers.getSetCookie()).toEqual([]);
  expect(await response.text()).toBe("");
});

it("sets each cookie in a header of its own, in order", () => {
  const response = respondRedirect("/", ["a=1; Path=/", "b=2; Path=/x; HttpOnly"]);

  expect(response.headers.getSetCookie()).toEqual(["a=1; Path=/", "b=2; Path=/x; HttpOnly"]);
});

it("keeps a relative address as it is", () => {
  expect(respondRedirect("/").headers.get("Location")).toBe("/");
});

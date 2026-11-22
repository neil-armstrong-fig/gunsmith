import {apiOriginOfPage} from "@src/react/components/dom/front-door/components/room-entry/make-room/api-origin/ApiOriginOfPage";

it("is the page's own origin on a local page, where Vite proxies /api", () => {
  expect(apiOriginOfPage({protocol: "http:", host: "localhost:3400"})).toBe("http://localhost:3400");
});

it("is the page's own origin on another secure host", () => {
  expect(apiOriginOfPage({protocol: "https:", host: "gunsmith.example"})).toBe("https://gunsmith.example");
});

it("is the API's hostname for the deployed webapp", () => {
  expect(apiOriginOfPage({protocol: "https:", host: "gunsmith.neilarmstrong.dev"})).toBe(
    "https://gunsmith-api.neilarmstrong.dev",
  );
});

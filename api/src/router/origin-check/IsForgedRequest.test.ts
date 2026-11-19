import {isForgedRequest} from "@src/router/origin-check/IsForgedRequest";

const SETTINGS = {ALLOWED_ORIGINS: "https://gunsmith.test"};

it("lets a state-changing request from the site through", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    expect(isForgedRequest(request({method, origin: "https://gunsmith.test"}), SETTINGS)).toBe(false);
  }
});

it("turns away a state-changing request from another page, whatever the method", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    expect(isForgedRequest(request({method, origin: "https://evil.test"}), SETTINGS)).toBe(true);
  }
});

it("turns away a state-changing request that names no origin", () => {
  expect(isForgedRequest(request({method: "POST"}), SETTINGS)).toBe(true);
});

it("turns away a WebSocket upgrade from another page or from none, and lets the site's through", () => {
  expect(isForgedRequest(request({upgrade: true, origin: "https://evil.test"}), SETTINGS)).toBe(true);
  expect(isForgedRequest(request({upgrade: true}), SETTINGS)).toBe(true);
  expect(isForgedRequest(request({upgrade: true, origin: "https://gunsmith.test"}), SETTINGS)).toBe(false);
});

it("does not ask a plain read, from anyone, for an origin", () => {
  expect(isForgedRequest(request({method: "GET"}), SETTINGS)).toBe(false);
  expect(isForgedRequest(request({method: "GET", origin: "https://evil.test"}), SETTINGS)).toBe(false);
  expect(isForgedRequest(request({method: "HEAD"}), SETTINGS)).toBe(false);
});

it("trusts a local page only when the Worker was started for local use", () => {
  const local = request({method: "POST", origin: "http://localhost:3450"});

  expect(isForgedRequest(local, SETTINGS)).toBe(true);
  expect(isForgedRequest(local, {...SETTINGS, ALLOW_LOOPBACK_ORIGINS: "true"})).toBe(false);
});

interface RequestShape {
  method?: string;
  origin?: string;
  upgrade?: boolean;
}

function request({method = "GET", origin, upgrade}: RequestShape): Request {
  const headers = new Headers();
  if (origin) {
    headers.set("Origin", origin);
  }
  if (upgrade) {
    headers.set("Upgrade", "websocket");
  }

  return new Request("https://gunsmith.test/api/anything", {method, headers});
}

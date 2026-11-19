import {loginAllowed} from "@src/router/routes/sign-in/login-limit/LoginAllowed";

it("lets a request in when the limiter says it has room, and turns it away when it does not", async () => {
  expect(await loginAllowed(limiter({allowed: true}), request())).toBe(true);
  expect(await loginAllowed(limiter({allowed: false}), request())).toBe(false);
});

it("counts requests by the address Cloudflare saw", async () => {
  const keys: string[] = [];

  await loginAllowed(limiter({allowed: true, keys}), request({"CF-Connecting-IP": "203.0.113.9"}));

  expect(keys).toEqual(["203.0.113.9"]);
});

it("counts a request with no address together with the others that have none", async () => {
  const keys: string[] = [];

  await loginAllowed(limiter({allowed: true, keys}), request());

  expect(keys).toEqual(["unknown"]);
});

it("lets a request in when the limiter itself fails: it is a brake on scripts, not a gate for players", async () => {
  expect(await loginAllowed(limiter({fails: true}), request())).toBe(true);
});

interface LimiterShape {
  allowed?: boolean;
  fails?: boolean;
  keys?: string[];
}

function limiter({allowed = true, fails = false, keys = []}: LimiterShape): RateLimit {
  return {
    limit: async ({key}) => {
      keys.push(key);
      if (fails) {
        throw new Error("the limiter is down");
      }

      return {success: allowed};
    },
  };
}

function request(headers: Record<string, string> = {}): Request {
  return new Request("https://gunsmith.test/api/auth/google", {headers});
}

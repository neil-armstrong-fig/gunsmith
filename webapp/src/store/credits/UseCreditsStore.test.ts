import {useCreditsStore} from "@src/store/credits/UseCreditsStore";

afterEach(() => {
  vi.unstubAllGlobals();
  useCreditsStore.setState({credits: undefined});
});

it("keeps the balance, the allowance and the price of a Make from the answer", async () => {
  answerWith({balance: 6.5, dailyAllowance: 10, prices: {weapon: 1, rejected: 0.5}, aiOn: true});

  await useCreditsStore.getState().load("/api/credits");

  expect(useCreditsStore.getState().credits).toEqual({balance: 6.5, dailyAllowance: 10, makePrice: 1});
});

it("asks with the session cookie", async () => {
  const fetch = answerWith({balance: 7, dailyAllowance: 10, prices: {weapon: 1}});

  await useCreditsStore.getState().load("/api/credits");

  expect(fetch).toHaveBeenCalledWith("/api/credits", {credentials: "include"});
});

it("leaves the last balance when the answer does not parse", async () => {
  useCreditsStore.setState({credits: {balance: 7, dailyAllowance: 10, makePrice: 1}});
  answerWith({balance: "seven"});

  await useCreditsStore.getState().load("/api/credits");

  expect(useCreditsStore.getState().credits).toEqual({balance: 7, dailyAllowance: 10, makePrice: 1});
});

it("leaves the last balance when the player is not signed in", async () => {
  useCreditsStore.setState({credits: {balance: 7, dailyAllowance: 10, makePrice: 1}});
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(Response.json({error: "account-required"}, {status: 401}))),
  );

  await useCreditsStore.getState().load("/api/credits");

  expect(useCreditsStore.getState().credits).toEqual({balance: 7, dailyAllowance: 10, makePrice: 1});
});

function answerWith(body: unknown): ReturnType<typeof vi.fn> {
  const fetch = vi.fn(() => Promise.resolve(Response.json(body)));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

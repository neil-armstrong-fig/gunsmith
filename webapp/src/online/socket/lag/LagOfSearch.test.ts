import {lagOfSearch} from "@src/online/socket/lag/LagOfSearch";

it("reads how many milliseconds the page asks each frame to be held up", () => {
  expect(lagOfSearch("?room=ABC234&lag=120")).toBe(120);
});

it("is none for a page that asks for none, or asks for something that is not a whole number of milliseconds", () => {
  expect(lagOfSearch("?room=ABC234")).toBe(0);
  expect(lagOfSearch("?lag=")).toBe(0);
  expect(lagOfSearch("?lag=fast")).toBe(0);
  expect(lagOfSearch("?lag=-5")).toBe(0);
  expect(lagOfSearch("?lag=1.5")).toBe(0);
  expect(lagOfSearch("?lag=0")).toBe(0);
});

it("cuts a lag to two seconds", () => {
  expect(lagOfSearch("?lag=99999")).toBe(2000);
});

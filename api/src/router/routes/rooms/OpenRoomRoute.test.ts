import {openRoomRoute} from "@src/router/routes/rooms/OpenRoomRoute";
import {isFriendCode} from "@gunsmith/shared/online/friend-code/IsFriendCode";

it("opens a private room and answers its friend code", async () => {
  const response = openRoomRoute(new Request("https://gunsmith.test/api/rooms", {method: "POST"}));
  const body = (await response.json()) as {code: string};

  expect(response.status).toBe(201);
  expect(isFriendCode(body.code)).toBe(true);
});

it("answers a different code to each room", async () => {
  const open = async (): Promise<string> => {
    const response = openRoomRoute(new Request("https://gunsmith.test/api/rooms", {method: "POST"}));

    return ((await response.json()) as {code: string}).code;
  };

  expect(await open()).not.toBe(await open());
});

it("refuses any way of asking for a room but POST", () => {
  const response = openRoomRoute(new Request("https://gunsmith.test/api/rooms"));

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("POST");
});

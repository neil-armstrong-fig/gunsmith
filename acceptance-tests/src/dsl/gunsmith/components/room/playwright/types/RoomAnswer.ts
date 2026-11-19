/** What the server answered a page that asked for a private room: the status and the body, read inside the page. */
export interface RoomAnswer {
  status: number;
  body: unknown;
}

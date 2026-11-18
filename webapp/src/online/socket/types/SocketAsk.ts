/** What a connection to a room may show besides its address. */
export interface SocketAsk {
  /** The secret the room gave this browser's seat, shown to get the seat back. */
  token?: string | undefined;
  /** The page's own query (`location.search`): how long the page asks the room to wait for a person is passed on from it. */
  search?: string | undefined;
}

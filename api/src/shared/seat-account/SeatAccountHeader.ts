/**
 * The header the Worker puts on a socket upgrade it hands to a `Match` to say whose session came with it. Only the Worker sets it (it
 * drops any a page sent), and a room is reached only through the Worker, so a `Match` may believe it. Absent for a guest.
 */
export const SEAT_ACCOUNT_HEADER = "X-Seat-Account";

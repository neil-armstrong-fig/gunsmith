/**
 * How a match is paced (tunable): the engine steps by 1/60 s, the same step the browser's loop takes, so a seat that predicts runs the
 * same simulation. The clock fires 30 times a second and plays however many steps real time has made it owe (`StepsOwed`: two, when the
 * timer is on time), sending a snapshot after each firing. The browser predicts its own fighter and blends the other between snapshots, so
 * what it is sent need not keep up with what it draws. It was 60 a second while nothing smoothed what a browser was sent: a snapshot
 * every 50 ms looked choppier than the local game. 30 halves the Durable Object's CPU and bandwidth against that; the free-versus-paid
 * choice waits for a real measurement (the free-plan spike in `POSTMVP-TODO.md`).
 */
export const MATCH_TICK = {
  stepSeconds: 1 / 60,
  snapshotIntervalMilliseconds: 1000 / 30,
} as const;

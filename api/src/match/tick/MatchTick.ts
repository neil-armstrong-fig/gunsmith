/**
 * How a match is paced (tunable): the engine steps by 1/60 s, the same step the browser's loop takes, so a seat that predicts
 * later runs the same simulation. The clock fires about 60 times a second and plays however many steps real time has made it owe
 * (`StepsOwed`), sending a snapshot after each firing. It was a snapshot every 50 ms (three steps), which made movement visibly
 * choppier than the local game: a browser only draws what it is sent. 60 a second is the simplest cure on localhost and costs
 * three times the Durable Object's CPU and bandwidth, so it is a stopgap until the browser predicts its own fighter and smooths
 * the other (`docs/match-netcode.md`), which lets the server go back to 20 to 30.
 */
export const MATCH_TICK = {
  stepSeconds: 1 / 60,
  snapshotIntervalMilliseconds: 1000 / 60,
} as const;

/**
 * How far the server has played this browser's inputs,: the `seq` of the newest input it has received, and how many
 * engine steps have been played with that input in force since. The browser replays what it did after that point (`ReplayInputs`).
 */
export interface InputAck {
  seq: number;
  held: number;
}

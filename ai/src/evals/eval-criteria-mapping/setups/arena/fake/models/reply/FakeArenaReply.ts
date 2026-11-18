/**
 * What the fake tier's generator always answers: a playable arena, written here as drawing rows (north first), with a pillar hall
 * on the low ground and one raised platform reached by a stair. It is the mapping's own copy, not the DSL's test fixture, so setup
 * never depends on a test helper. The driver's test runs it through the real pipeline, so a change to the rules that this arena no
 * longer meets fails there.
 */
export const FAKE_ARENA_REPLY = {
  name: "Pillar Hall",
  rows: [
    "####################",
    "#..................#",
    "#..##..........##..#",
    "#..##....>11...##..#",
    "#........#11.......#",
    "#..##....#11...##..#",
    "#..##..........##..#",
    "#..................#",
    "####################",
  ],
};

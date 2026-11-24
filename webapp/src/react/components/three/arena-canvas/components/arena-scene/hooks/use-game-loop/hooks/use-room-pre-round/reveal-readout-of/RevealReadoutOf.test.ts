import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {revealReadoutOf} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/reveal-readout-of/RevealReadoutOf";
import type {RevealFrame} from "@src/online/types/RevealFrame";

const frame: RevealFrame = {
  kind: "reveal",
  arena: {name: "Duel", rows: ["###", "#.#", "###"]},
  weapons: {
    own: [
      {kind: "builtIn", key: "submachine-gun"},
      {kind: "builtIn", key: "rifle"},
    ],
    opponent: [
      {kind: "builtIn", key: "rifle"},
      {kind: "builtIn", key: "rifle"},
    ],
  },
};

it("gives the weapons each side carries, from the built-ins the page has, and the arena", () => {
  expect(revealReadoutOf(frame)).toEqual({
    arenaName: "Duel",
    arenaRows: ["###", "#.#", "###"],
    own: [SUBMACHINE_GUN, RIFLE],
    opponent: [RIFLE, RIFLE],
  });
});

it("takes the weapon a saved choice carries, since the page does not have it", () => {
  const saved = {...SUBMACHINE_GUN, identity: {key: "saved", name: "Sparky"}};
  const withSaved: RevealFrame = {
    ...frame,
    weapons: {
      ...frame.weapons,
      opponent: [
        {kind: "saved", weapon: saved, appearance: {version: 1} as never},
        {kind: "builtIn", key: "rifle"},
      ],
    },
  };

  expect(revealReadoutOf(withSaved)?.opponent).toEqual([saved, RIFLE]);
});

it("gives nothing for a built-in the page does not know", () => {
  const unknown: RevealFrame = {
    ...frame,
    weapons: {
      ...frame.weapons,
      own: [
        {kind: "builtIn", key: "no-such-weapon"},
        {kind: "builtIn", key: "rifle"},
      ],
    },
  };

  expect(revealReadoutOf(unknown)).toBeUndefined();
});

it("gives nothing when the server has said nothing", () => {
  expect(revealReadoutOf(undefined)).toBeUndefined();
});

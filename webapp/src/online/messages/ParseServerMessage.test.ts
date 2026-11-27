import {parseServerMessage} from "@src/online/messages/ParseServerMessage";

it("reads the frame that seats a browser", () => {
  const text = JSON.stringify({kind: "joined", seat: "second", arena: ["###", "#.#", "###"]});

  expect(parseServerMessage(text)).toEqual({kind: "joined", seat: "second", arena: ["###", "#.#", "###"]});
});

it("reads the token that gets the seat back", () => {
  const text = JSON.stringify({kind: "joined", seat: "first", arena: ["###"], token: "the-token"});
  const message = parseServerMessage(text);

  expect(message?.kind === "joined" && message.token).toBe("the-token");
});

it("refuses a seating whose token is not text", () => {
  const frame = {kind: "joined", seat: "first", arena: ["###"]};

  expect(parseServerMessage(JSON.stringify({...frame, token: 7}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, token: null}))).toBeUndefined();
});

it("reads a snapshot", () => {
  const text = JSON.stringify({
    kind: "snapshot",
    player: {health: 5},
    bullets: [],
    round: "playing",
    elapsedSeconds: 0,
  });

  expect(parseServerMessage(text)?.kind).toBe("snapshot");
});

it("reads how far the server has played this browser's inputs", () => {
  const text = JSON.stringify({kind: "snapshot", player: {}, round: "playing", ack: {seq: 7, held: 3}});
  const message = parseServerMessage(text);

  expect(message?.kind === "snapshot" && message.ack).toEqual({seq: 7, held: 3});
});

it("refuses a snapshot whose ack is not two counts", () => {
  const frame = {kind: "snapshot", player: {}, round: "playing"};

  expect(parseServerMessage(JSON.stringify({...frame, ack: {seq: "7", held: 3}}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, ack: {seq: 7}}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, ack: 7}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, ack: null}))).toBeUndefined();
});

it("reads who has asked to go on", () => {
  const text = JSON.stringify({kind: "snapshot", player: {}, round: "won", ready: {player: true, opponent: false}});
  const message = parseServerMessage(text);

  expect(message?.kind === "snapshot" && message.ready).toEqual({player: true, opponent: false});
});

it("refuses a snapshot whose ready is not two flags", () => {
  const frame = {kind: "snapshot", player: {}, round: "won"};

  expect(parseServerMessage(JSON.stringify({...frame, ready: {player: "yes", opponent: false}}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, ready: {player: true}}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, ready: true}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, ready: null}))).toBeUndefined();
});

it("refuses text that is not a frame, and frames missing what the page acts on", () => {
  expect(parseServerMessage("nope")).toBeUndefined();
  expect(parseServerMessage("7")).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({kind: "unheard-of"}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({kind: "joined", seat: "third", arena: []}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({kind: "joined", seat: "first", arena: [1]}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({kind: "snapshot", round: "playing"}))).toBeUndefined();
});

it("reads the frame that says which arena the match is played in", () => {
  const text = JSON.stringify({kind: "arena", rows: ["###", "#.#", "###"]});

  expect(parseServerMessage(text)).toEqual({kind: "arena", rows: ["###", "#.#", "###"]});
});

it("refuses an arena whose rows are not all text", () => {
  expect(parseServerMessage(JSON.stringify({kind: "arena", rows: ["###", 7]}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({kind: "arena"}))).toBeUndefined();
});

it("reads what the server says about the choosing", () => {
  const frame = {
    kind: "preRound",
    stage: "picking",
    builtInArenas: ["Duel", "Keep", "Slalom", "Pinwheel", "Catwalk"],
    secondsLeft: 42,
    own: {
      arena: {kind: "builtIn", name: "Duel"},
      locked: true,
      pick: {kind: "arena", seat: "second"},
      weapons: {
        slots: [
          {locked: true, choice: {kind: "builtIn", key: "rifle"}},
          {locked: true, choice: {kind: "builtIn", key: "marksman-rifle"}},
        ],
      },
    },
    opponent: {
      locked: true,
      picked: false,
      arena: {kind: "saved", name: "Little room", rows: ["###", "#.#", "###"]},
      weapons: {
        slots: [{locked: true, choice: {kind: "saved", name: "Sparky"}}, {locked: false}],
      },
    },
    how: "coin",
  };

  expect(parseServerMessage(JSON.stringify(frame))).toEqual(frame);
});

it("reads the choosing of a seat on its own, with no clock and no opponent arena", () => {
  expect(parseServerMessage(JSON.stringify(ALONE))).toEqual(ALONE);
});

it("reads the reveal stage, with who has asked to begin", () => {
  const frame = {
    ...ALONE,
    stage: "revealing",
    secondsLeft: 30,
    own: {...ALONE.own, ready: true},
    opponent: {...ALONE.opponent, ready: false},
    how: "same",
  };

  expect(parseServerMessage(JSON.stringify(frame))).toEqual(frame);
});

it("refuses a choosing frame without the day's built-in arenas as a list of names", () => {
  const {builtInArenas, ...frame} = ALONE;

  expect(builtInArenas).toHaveLength(5);

  expect(parseServerMessage(JSON.stringify(frame))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, builtInArenas: "Duel"}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, builtInArenas: ["Duel", 3]}))).toBeUndefined();
});

it("refuses a choosing frame that is not what the server sends", () => {
  const frame = ALONE;
  const slots = (...locked: boolean[]): object => ({slots: locked.map(flag => ({locked: flag}))});

  expect(parseServerMessage(JSON.stringify({...frame, stage: "later"}))).toBeUndefined();
  expect(
    parseServerMessage(JSON.stringify({...frame, own: {locked: "no", weapons: slots(false, false)}})),
  ).toBeUndefined();
  expect(
    parseServerMessage(JSON.stringify({...frame, opponent: {locked: false, weapons: slots(false, false)}})),
  ).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, own: {locked: false}}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, opponent: {locked: false, picked: false}}))).toBeUndefined();
  expect(
    parseServerMessage(JSON.stringify({...frame, own: {locked: false, weapons: {locked: false}}})),
  ).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, own: {locked: false, weapons: slots(false)}}))).toBeUndefined();
  expect(
    parseServerMessage(JSON.stringify({...frame, own: {locked: false, weapons: slots(false, false, false)}})),
  ).toBeUndefined();
  expect(
    parseServerMessage(
      JSON.stringify({...frame, own: {locked: false, weapons: {slots: [{locked: "no"}, {locked: false}]}}}),
    ),
  ).toBeUndefined();
  expect(
    parseServerMessage(
      JSON.stringify({
        ...frame,
        own: {locked: false, weapons: {slots: [{locked: true, choice: {kind: "builtIn", key: 3}}, {locked: false}]}},
      }),
    ),
  ).toBeUndefined();
  expect(
    parseServerMessage(
      JSON.stringify({
        ...frame,
        own: {locked: false, weapons: {slots: [{locked: true, choice: {kind: "saved"}}, {locked: false}]}},
      }),
    ),
  ).toBeUndefined();
  expect(
    parseServerMessage(
      JSON.stringify({...frame, own: {locked: false, arena: {kind: "saved", name: 7}, weapons: slots(false, false)}}),
    ),
  ).toBeUndefined();
  expect(
    parseServerMessage(JSON.stringify({...frame, own: {locked: false, arena: "Duel", weapons: slots(false, false)}})),
  ).toBeUndefined();
  expect(
    parseServerMessage(
      JSON.stringify({
        ...frame,
        opponent: {
          locked: true,
          picked: false,
          arena: {kind: "saved", name: "A", rows: [1]},
          weapons: slots(false, false),
        },
      }),
    ),
  ).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, own: {...frame.own, ready: "yes"}}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, secondsLeft: "soon"}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, own: null}))).toBeUndefined();
});

it("reads the one frame that reveals the arena and both players' weapons, a saved one with its numbers and drawing", () => {
  const frame = {
    kind: "reveal",
    arena: {name: "Duel", rows: ["###", "#.#", "###"]},
    weapons: {
      own: [
        {kind: "builtIn", key: "rifle"},
        {kind: "builtIn", key: "marksman-rifle"},
      ],
      opponent: [
        {kind: "saved", weapon: {bulletDamage: 20}, appearance: {version: 1}},
        {kind: "builtIn", key: "submachine-gun"},
      ],
    },
  };

  expect(parseServerMessage(JSON.stringify(frame))).toEqual(frame);
});

it("refuses a reveal that is not two weapons on each side, each a built-in key or a saved weapon with its drawing", () => {
  const frame = {
    kind: "reveal",
    arena: {name: "Duel", rows: ["###"]},
    weapons: {
      own: [
        {kind: "builtIn", key: "rifle"},
        {kind: "builtIn", key: "rifle"},
      ],
      opponent: [
        {kind: "builtIn", key: "rifle"},
        {kind: "builtIn", key: "rifle"},
      ],
    },
  };
  const oneWeapon = [{kind: "builtIn", key: "rifle"}];
  const noDrawing = [
    {kind: "saved", weapon: {bulletDamage: 20}},
    {kind: "builtIn", key: "rifle"},
  ];

  expect(parseServerMessage(JSON.stringify({...frame, weapons: {...frame.weapons, own: oneWeapon}}))).toBeUndefined();
  expect(
    parseServerMessage(JSON.stringify({...frame, weapons: {...frame.weapons, opponent: noDrawing}})),
  ).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, weapons: {own: frame.weapons.own}}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({kind: "reveal"}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, arena: undefined}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, arena: {name: "Duel", rows: [1]}}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, arena: {rows: ["###"]}}))).toBeUndefined();
});

it("reads the frame that tells the other player's saved weapon in a slot once, with its numbers and drawing", () => {
  const frame = {kind: "opponentWeapon", slot: 1, weapon: {bulletDamage: 20}, appearance: {version: 1}};

  expect(parseServerMessage(JSON.stringify(frame))).toEqual(frame);
});

it("refuses an opponent weapon frame without a slot of 1 or 2, numbers or a drawing", () => {
  const frame = {kind: "opponentWeapon", slot: 2, weapon: {bulletDamage: 20}, appearance: {version: 1}};

  expect(parseServerMessage(JSON.stringify({...frame, slot: 3}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, weapon: undefined}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, weapon: [20]}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, appearance: undefined}))).toBeUndefined();
});

const ALONE = {
  kind: "preRound",
  stage: "choosing",
  builtInArenas: ["Duel", "Keep", "Slalom", "Pinwheel", "Catwalk"],
  own: {locked: false, weapons: {slots: [{locked: false}, {locked: false}]}},
  opponent: {locked: false, picked: false, weapons: {slots: [{locked: false}, {locked: false}]}},
};

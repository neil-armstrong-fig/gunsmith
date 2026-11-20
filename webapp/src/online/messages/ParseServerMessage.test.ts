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
    secondsLeft: 42,
    own: {arena: "Duel", locked: true, pick: {kind: "arena", seat: "second"}},
    opponent: {locked: true, picked: false, arena: "Fair duel"},
    how: "coin",
  };

  expect(parseServerMessage(JSON.stringify(frame))).toEqual(frame);
});

it("reads the choosing of a seat on its own, with no clock and no opponent arena", () => {
  const frame = {kind: "preRound", stage: "choosing", own: {locked: false}, opponent: {locked: false, picked: false}};

  expect(parseServerMessage(JSON.stringify(frame))).toEqual(frame);
});

it("refuses a choosing frame that is not what the server sends", () => {
  const frame = {kind: "preRound", stage: "choosing", own: {locked: false}, opponent: {locked: false, picked: false}};

  expect(parseServerMessage(JSON.stringify({...frame, stage: "later"}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, own: {locked: "no"}}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, opponent: {locked: false}}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, secondsLeft: "soon"}))).toBeUndefined();
  expect(parseServerMessage(JSON.stringify({...frame, own: null}))).toBeUndefined();
});

import {parseServerMessage} from "@src/online/messages/ParseServerMessage";

it("reads the frame that seats a browser", () => {
  const text = JSON.stringify({kind: "joined", seat: "second", arena: ["###", "#.#", "###"]});

  expect(parseServerMessage(text)).toEqual({kind: "joined", seat: "second", arena: ["###", "#.#", "###"]});
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

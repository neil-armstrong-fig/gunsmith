import {DrawingQueue} from "@src/react/components/three/arena-preview-canvas/components/still-picture/hooks/use-turn-to-draw/queue/DrawingQueue";

it("gives a turn at once while fewer than the limit are drawing", () => {
  const queue = new DrawingQueue(2);
  const turns: string[] = [];

  queue.request(() => turns.push("a"));
  queue.request(() => turns.push("b"));

  expect(turns).toEqual(["a", "b"]);
});

it("makes the one past the limit wait until a turn is given back, then gives it the next", () => {
  const queue = new DrawingQueue(1);
  const turns: string[] = [];
  const giveBackA = queue.request(() => turns.push("a"));
  queue.request(() => turns.push("b"));
  queue.request(() => turns.push("c"));

  expect(turns).toEqual(["a"]);

  giveBackA();

  expect(turns).toEqual(["a", "b"]);
});

it("forgets one that gives up while still waiting, so it is never given a turn", () => {
  const queue = new DrawingQueue(1);
  const turns: string[] = [];
  const giveBackA = queue.request(() => turns.push("a"));
  const giveUpB = queue.request(() => turns.push("b"));
  queue.request(() => turns.push("c"));

  giveUpB();
  giveBackA();

  expect(turns).toEqual(["a", "c"]);
});

it("counts a turn given back twice once", () => {
  const queue = new DrawingQueue(1);
  const turns: string[] = [];
  const giveBackA = queue.request(() => turns.push("a"));
  const giveBackB = queue.request(() => turns.push("b"));
  queue.request(() => turns.push("c"));
  queue.request(() => turns.push("d"));

  giveBackA();
  giveBackA();

  expect(turns).toEqual(["a", "b"]);

  giveBackB();

  expect(turns).toEqual(["a", "b", "c"]);
});

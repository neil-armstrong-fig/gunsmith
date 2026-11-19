import {generatedDisplayName} from "@src/router/routes/sign-in/finish/generated-display-name/GeneratedDisplayName";

it("makes a two-word name from the random numbers it is given", () => {
  expect(generatedDisplayName(() => 0)).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
  expect(generatedDisplayName(() => 0.999999)).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
});

it("makes the same name from the same numbers", () => {
  expect(generatedDisplayName(draws(0.1, 0.2))).toBe(generatedDisplayName(draws(0.1, 0.2)));
});

it("chooses each word by its own draw", () => {
  const [adjective, animal] = generatedDisplayName(draws(0.1, 0.2)).split(" ");
  const [otherAdjective, sameAnimal] = generatedDisplayName(draws(0.6, 0.2)).split(" ");
  const [sameAdjective, otherAnimal] = generatedDisplayName(draws(0.1, 0.7)).split(" ");

  expect(otherAdjective).not.toBe(adjective);
  expect(sameAnimal).toBe(animal);
  expect(sameAdjective).toBe(adjective);
  expect(otherAnimal).not.toBe(animal);
});

it("never uses a digit or an email-shaped character", () => {
  for (let index = 0; index < 200; index += 1) {
    expect(generatedDisplayName(draws((index % 20) / 20, (index % 7) / 7))).not.toMatch(/[@0-9]/);
  }
});

function draws(...values: number[]): () => number {
  let index = 0;

  return () => values[index++ % values.length] ?? 0;
}

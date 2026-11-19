const ADJECTIVES = [
  "Quiet",
  "Swift",
  "Brave",
  "Calm",
  "Bright",
  "Steady",
  "Clever",
  "Bold",
  "Gentle",
  "Keen",
  "Lucky",
  "Nimble",
  "Proud",
  "Sly",
  "Warm",
  "Wild",
];
const ANIMALS = [
  "Falcon",
  "Heron",
  "Otter",
  "Badger",
  "Lynx",
  "Marten",
  "Raven",
  "Stoat",
  "Wolf",
  "Fox",
  "Hare",
  "Owl",
  "Crane",
  "Swift",
  "Moose",
  "Finch",
];

/**
 * A name for a new account, made of two words and nothing about the player: no email and no real name is ever stored
 * (`docs/privacy-and-data.md`). `random` is a parameter so a test can choose the words.
 */
export function generatedDisplayName(random: () => number = Math.random): string {
  return `${pick(ADJECTIVES, random)} ${pick(ANIMALS, random)}`;
}

function pick(words: readonly string[], random: () => number): string {
  return words[Math.floor(random() * words.length)] ?? "Quiet";
}

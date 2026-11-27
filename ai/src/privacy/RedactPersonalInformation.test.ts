import {redactPersonalInformation} from "@gunsmith/ai/privacy/RedactPersonalInformation";

// Synthetic details only: example.com addresses, Ofcom's drama phone range, a test card number, a fictional address.
it.each([
  {
    kind: "an email address",
    prompt: "a pistol engraved with jane.doe@example.com",
    redacted: "a pistol engraved with [email]",
  },
  {kind: "a web address", prompt: "like the one at https://example.com/guns?id=3", redacted: "like the one at [url]"},
  {kind: "a bare domain", prompt: "styled like example.co.uk", redacted: "styled like [url]"},
  {kind: "a social handle", prompt: "made for @sniper_jane", redacted: "made for [handle]"},
  {kind: "an IP address", prompt: "named after 192.168.0.12", redacted: "named after [ip]"},
  {kind: "an international phone number", prompt: "call me on +44 7700 900123", redacted: "call me on [phone]"},
  {kind: "a US phone number", prompt: "text (555) 123-4567 now", redacted: "text [phone] now"},
  {kind: "a dashed phone number", prompt: "ring 555-123-4567", redacted: "ring [phone]"},
  {kind: "a card number", prompt: "a rifle for 4111 1111 1111 1111", redacted: "a rifle for [card]"},
  {kind: "a dashed card number", prompt: "pay with 4111-1111-1111-1111", redacted: "pay with [card]"},
  {kind: "a long number", prompt: "my account 12345678901", redacted: "my account [id number]"},
  {
    kind: "a street address",
    prompt: "an arena shaped like 221B Baker Street",
    redacted: "an arena shaped like [address]",
  },
  {kind: "an abbreviated address", prompt: "I live at 10 Downing St", redacted: "I live at [address]"},
  {kind: "a UK postcode", prompt: "a map of NW1 6XE", redacted: "a map of [postcode]"},
  {kind: "a US ZIP+4 code", prompt: "from 20500-0003", redacted: "from [postcode]"},
  {kind: "a date of birth", prompt: "born 04/05/1990", redacted: "born [date]"},
  {kind: "a date written year first", prompt: "born 1990-04-05", redacted: "born [date]"},
])("replaces $kind with a placeholder and keeps the rest", ({prompt, redacted}) => {
  expect(redactPersonalInformation(prompt)).toBe(redacted);
});

it("replaces several details in one prompt and keeps the whitespace around them", () => {
  const prompt = "  An arena shaped like 221B Baker Street, NW1 6XE; mail jane.doe@example.com.\n";

  expect(redactPersonalInformation(prompt)).toBe("  An arena shaped like [address], [postcode]; mail [email].\n");
});

it("calls a long number that fails the card checksum an id number, not a card", () => {
  expect(redactPersonalInformation("number 1234567890123456")).toBe("number [id number]");
});

it.each([
  "a shotgun that fires 3 pellets",
  "a 40 by 30 arena with two levels",
  "damage 25, magazine 30, range 12",
  "1000 rounds a minute",
  "an AK-47 with a 5.56mm round",
  "an M1911 pistol and the M4A1 carbine",
  "a .50 cal rifle with a fire rate of 0.5 s",
  "a tower up to level 2 with stairs at 3 and 7",
  "a 3 lane road arena",
  "a sniper with 120 150 200 damage falloff",
  "a cover block every 4-5 tiles",
  "e.g. a rifle, i.e. a long gun",
  "an arena for 1v1 fights, 30x20",
  "a gun called Dragon Fang",
])("leaves the game prompt %j unchanged", prompt => {
  expect(redactPersonalInformation(prompt)).toBe(prompt);
});

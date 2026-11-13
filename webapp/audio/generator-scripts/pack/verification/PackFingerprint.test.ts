import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {it} from "node:test";
import {makeAudioPack} from "@gunsmith/audio-studies/pack/MakeAudioPack";

// A fingerprint of every recipe in the pack: each cue, and each voice in it, with every number. It changes if a pitch, a note,
// a pattern, a time or a gain does, in milliseconds. The user has approved how this pack sounds, so a change here is a change of
// sound: run `pnpm test:render` to see the files change, let the user listen, and only then update the fingerprint.
const FINGERPRINT = "013f611b07ae1d4b027a8cfd92fb6b9b1082a54f0d02d4f8f12aa394d3a8a6c1";

it("has the recipes the approved pack was rendered from", () => {
  const fingerprint = createHash("sha256").update(JSON.stringify(makeAudioPack())).digest("hex");

  assert.equal(fingerprint, FINGERPRINT, "a recipe changed: this is a change of sound, not a refactor");
});

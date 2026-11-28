import type {ChoiceKind} from "@src/dsl/gunsmith/components/room/components/frames/types/ChoiceKind";
import type {ChoiceStep} from "@src/dsl/gunsmith/components/room/components/frames/types/ChoiceStep";
import type {SentChoice} from "@src/dsl/gunsmith/components/room/components/frames/types/SentChoice";

/** The `choose` frames among the text frames a browser sent, in order, as what each put forward. A frame that is not JSON, or says nothing a spec can read, is skipped. */
export function choicesOfSentFrames(frames: readonly string[]): readonly SentChoice[] {
  const choices: SentChoice[] = [];

  for (const frame of frames) {
    const choice = choiceOfFrame(frame);
    if (choice) {
      choices.push(choice);
    }
  }

  return choices;
}

function choiceOfFrame(frame: string): SentChoice | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(frame);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }

  if (Reflect.get(parsed, "kind") !== "choose") {
    return undefined;
  }

  const step = stepOf(Reflect.get(parsed, "step"));
  const choice: unknown = Reflect.get(parsed, "choice");
  if (!step || typeof choice !== "object" || choice === null) {
    return undefined;
  }

  const kind = kindOf(Reflect.get(choice, "kind"));
  const reference = referenceOf(choice, kind, step);
  if (!kind || reference === undefined) {
    return undefined;
  }

  return {step, slot: slotOf(Reflect.get(parsed, "slot")), kind, reference};
}

function stepOf(step: unknown): ChoiceStep | undefined {
  if (step === "weapon" || step === "arena") {
    return step;
  }

  return undefined;
}

function kindOf(kind: unknown): ChoiceKind | undefined {
  if (kind === "builtIn" || kind === "saved") {
    return kind;
  }

  return undefined;
}

function slotOf(slot: unknown): number | undefined {
  if (typeof slot === "number") {
    return slot;
  }

  return undefined;
}

/** What a choice names: a saved item's id, a built-in weapon's key or a built-in arena's name. */
function referenceOf(choice: object, kind: ChoiceKind | undefined, step: ChoiceStep): string | undefined {
  if (kind === "saved") {
    return stringAt(choice, "id");
  }

  if (step === "weapon") {
    return stringAt(choice, "key");
  }

  return stringAt(choice, "name");
}

function stringAt(value: object, field: string): string | undefined {
  const text: unknown = Reflect.get(value, field);
  if (typeof text === "string") {
    return text;
  }

  return undefined;
}

import type {InputAck} from "@gunsmith/shared/online/types/InputAck";

/** `reached` after `steps` more steps have been played with its input: the same input, held that much longer. Nothing sent stays nothing. */
export function heldFor(reached: InputAck | undefined, steps: number): InputAck | undefined {
  if (!reached || steps <= 0) {
    return reached;
  }

  return {seq: reached.seq, held: reached.held + steps};
}

import type {Input} from "@gunsmith/engine/game-loop/types/Input";

/** What a browser's input frame asks for, and the number it gave it (`seq`): the browser's own count of its fixed steps when the input began to hold. */
export interface InputMessage {
  seq: number;
  input: Input;
}

import type {ContainerKind} from "@gunsmith/ai/pipeline/appearance/check/fix/unwrap/types/ContainerKind";

/** A top-level field of an appearance and the kind of container it must be. */
export interface ContainerField {
  name: string;
  container: ContainerKind;
}

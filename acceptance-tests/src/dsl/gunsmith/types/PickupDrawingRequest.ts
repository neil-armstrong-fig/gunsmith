import type {PickupDrawing} from "@src/dsl/gunsmith/types/PickupDrawing";

/** A sparring match whose weapon is drawn as one of the named drawings; `seed` says where it lies. */
export interface PickupDrawingRequest {
  seed: number;
  drawing: PickupDrawing;
}

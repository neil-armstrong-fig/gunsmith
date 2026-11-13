/** Planar PCM extracted with copyFromChannel at the native SDK boundary. */
export interface RenderedCue {
  key: string;
  channels: Float32Array[];
  loop?: boolean;
}

/** Channels encoded as 16-bit PCM, with the loudest sample and the summed power measured from what was written. */
export interface EncodedPcm {
  /** Interleaved little-endian samples, frame by frame. */
  data: Buffer;
  /** The loudest encoded sample, as a share of full scale. */
  peak: number;
  /** The sum of every encoded sample's square, as a share of full scale. */
  power: number;
}

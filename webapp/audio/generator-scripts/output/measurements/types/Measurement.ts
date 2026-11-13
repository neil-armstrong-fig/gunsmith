/** Sample-domain measurements, not perceived loudness or oversampled true peak. */
export interface Measurement {
  seconds: number;
  channels: number;
  peakDbfs: number;
  rmsDbfs: number;
  sha256: string;
  seamJumpDbfs?: number;
  threeRepeatsSeconds?: number;
}

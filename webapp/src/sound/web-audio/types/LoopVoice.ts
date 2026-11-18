export interface LoopVoice {
  source: AudioBufferSourceNode;
  gain: GainNode;
  startedAt: number;
  stopping: boolean;
}

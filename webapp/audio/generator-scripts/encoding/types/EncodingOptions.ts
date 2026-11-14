/** Where to read the masters, where to write the exports, and which encoder to run when it is not the default. */
export interface EncodingOptions {
  source: string;
  output: string;
  ffmpeg?: string;
}

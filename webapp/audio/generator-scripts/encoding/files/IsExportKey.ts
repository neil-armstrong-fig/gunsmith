/** Effects and music, named in lowercase words and digits. The audition mix is neither, so it is never exported. */
const EXPORT_KEY = /^(sfx|music)-[a-z0-9-]+$/;

/** Whether a master's key may become an export's file name. Nothing else ever reaches the file system or the encoder. */
export function isExportKey(key: string): boolean {
  return EXPORT_KEY.test(key);
}

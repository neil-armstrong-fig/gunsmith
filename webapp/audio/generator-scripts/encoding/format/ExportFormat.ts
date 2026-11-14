/** The formats a master is exported in, in the order they are encoded. */
export const EXPORT_FORMATS = ["ogg", "mp3"] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];

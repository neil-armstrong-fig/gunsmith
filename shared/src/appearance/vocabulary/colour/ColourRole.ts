/**
 * What a part's fill or stroke may be: a role the renderer resolves (the fixed greys, the two accents the palette names, or
 * nothing), never a colour value. `outline` is the fixed dark role `simple-machinery-04` proposes beside `edge`.
 */
export const COLOUR_ROLES = ["none", "body", "edge", "outline", "text", "accent", "accent-secondary"] as const;

/** One colour role, read off the list so the two cannot drift apart. */
export type ColourRole = (typeof COLOUR_ROLES)[number];

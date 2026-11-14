/** The ways a stair can climb, as the compass has them: `north` is the way `y` grows. */
export const UPHILLS = ["north", "south", "east", "west"] as const;

export type Uphill = (typeof UPHILLS)[number];

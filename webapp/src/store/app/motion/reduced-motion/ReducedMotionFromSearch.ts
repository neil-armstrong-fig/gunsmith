/** Whether the page's query (`?reducedMotion=1`) asks for reduced motion, as a person's system setting would. Any other value, or none, does not. */
export function reducedMotionFromSearch(search: string): boolean {
  return new URLSearchParams(search).get("reducedMotion") === "1";
}

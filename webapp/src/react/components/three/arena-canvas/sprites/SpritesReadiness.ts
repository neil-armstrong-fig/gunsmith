/**
 * Whether every picture the scene draws has loaded or been given up on, which the arena says in `data-sprites-ready`: pictures decode after the page
 * opens, a placeholder shows until they do, and a spec that read the screen before then would see the placeholder.
 */
let requested = false;
let loading = 0;
const listeners = new Set<() => void>();

/** Counts a load as under way until it settles, either way, then tells whoever is listening. */
export async function trackLoad(load: Promise<void>): Promise<void> {
  loading += 1;

  try {
    await load;
  } finally {
    loading -= 1;
    announce();
  }
}

/** Says the loads have all been started, so that having none under way means done and not "not begun". */
export function markSpritesRequested(): void {
  requested = true;
  announce();
}

export function areSpritesReady(): boolean {
  return requested && loading === 0;
}

/** Calls `listener` whenever a load settles or the loads are requested; the function returned stops it. */
export function subscribeToSprites(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/** Starts again, as a page that has not loaded anything. For tests: a page never goes back. */
export function forgetSprites(): void {
  requested = false;
  loading = 0;
  listeners.clear();
}

function announce(): void {
  listeners.forEach(listener => {
    listener();
  });
}

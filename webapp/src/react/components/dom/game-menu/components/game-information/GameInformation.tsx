import type {JSX} from "react";

const LINK_STYLES = "text-xs text-gs-ui-muted underline underline-offset-4 hover:text-gs-team-blue";

export function GameInformation(): JSX.Element {
  return (
    <nav aria-label="Game information" className="mt-1 flex flex-col items-start gap-2">
      <a href="/references.html" target="_blank" rel="noopener" className={LINK_STYLES}>
        References &amp; credits
      </a>

      <a href="/privacy.html" target="_blank" rel="noopener" className={LINK_STYLES}>
        Privacy Policy
      </a>

      <a href="/terms.html" target="_blank" rel="noopener" className={LINK_STYLES}>
        Terms of Service
      </a>
    </nav>
  );
}

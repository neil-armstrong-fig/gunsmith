import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import type {JSX} from "react";

export function WorkshopPolicies(): JSX.Element {
  const signedIn = useAccountLibraryStore(state => state.session === "signed-in");

  return (
    <div className="space-y-1.5 text-sm text-gs-ui-muted">
      {signedIn && (
        <p data-testid="make-privacy-notice">
          Make sends your prompt to an AI provider to create your item. If Make creates an item, we keep it with your
          prompt so you can save it to your shelf and reuse the prompt.
        </p>
      )}

      <nav aria-label="Gunsmith policies" className="flex flex-wrap gap-x-4 gap-y-1 text-gs-team-blue">
        <a className="underline" href="/privacy.html">
          Privacy Policy
        </a>

        <a className="underline" href="/terms.html">
          Terms of Service
        </a>
      </nav>
    </div>
  );
}

import {creditLine} from "@src/react/components/dom/workshop/components/credit-balance/line/CreditLine";
import {useCreditRefresh} from "@src/react/components/dom/workshop/components/credit-balance/hooks/use-credit-refresh/UseCreditRefresh";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {useCreditsStore} from "@src/store/credits/UseCreditsStore";
import type {JSX} from "react";

/** A signed-in player's credits for the day and what a Make costs, kept up to date as they make things. A guest sees nothing. */
export function CreditBalance(): JSX.Element | undefined {
  useCreditRefresh();
  const signedIn = useAccountLibraryStore(state => state.session === "signed-in");
  const credits = useCreditsStore(state => state.credits);

  if (!signedIn || !credits) {
    return undefined;
  }

  return (
    <p data-testid="credit-balance" className="text-sm text-gs-ui-text">
      {creditLine(credits)}
    </p>
  );
}

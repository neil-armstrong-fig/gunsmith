import {accountUrl} from "@src/account/AccountUrl";
import {makeAccountArena} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-prompt/account-arena/MakeAccountArena";
import {standInArenaFor} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-prompt/stand-in/StandInArenaFor";
import {WorkshopPrompt} from "@src/react/components/dom/workshop/components/workshop-prompt/WorkshopPrompt";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";
import type {JSX} from "react";

const ARENA_PROMPT_LIMIT = 1000;

export function ArenaPrompt(): JSX.Element {
  const prompt = useArenaWorkshopStore(state => state.prompt);
  const session = useAccountLibraryStore(state => state.session);
  const making = useArenaWorkshopStore(state => state.making);
  const error = useArenaWorkshopStore(state => state.makeError);

  const make = async (): Promise<void> => {
    const {making: pending, setResult, setMaking, setMakeError} = useArenaWorkshopStore.getState();
    if (pending || session === "checking") return;

    setMakeError(undefined);
    if (session === "guest") {
      setResult({...standInArenaFor(prompt), madeFromPrompt: prompt});
      return;
    }

    setMaking(true);
    try {
      setResult(await makeAccountArena(prompt));
    } catch (cause) {
      setMakeError(cause instanceof Error ? cause.message : "Could not make an arena.");
    } finally {
      setMaking(false);
    }
  };

  return (
    <>
      <WorkshopPrompt
        id="workshop-arena-prompt"
        label="Describe your arena"
        prompt={prompt}
        limit={ARENA_PROMPT_LIMIT}
        placeholder="Try a yard with a pillar or a raised platform with stairs"
        making={making}
        waiting={session === "checking"}
        onPromptChange={useArenaWorkshopStore.getState().setPrompt}
        onMake={() => {
          void make();
        }}
      />

      {session === "guest" && (
        <a
          className="text-sm text-gs-team-blue underline"
          href={accountUrl(`/api/auth/google?return=${encodeURIComponent(window.location.href)}`)}
        >
          Sign in with Google to make and save arenas
        </a>
      )}

      {error && (
        <p role="alert" className="text-sm text-gs-ring">
          {error}
        </p>
      )}
    </>
  );
}

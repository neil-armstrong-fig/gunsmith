import {standInArenaFor} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-prompt/stand-in/StandInArenaFor";
import {WorkshopPrompt} from "@src/react/components/dom/workshop/components/workshop-prompt/WorkshopPrompt";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";
import type {JSX} from "react";

const ARENA_PROMPT_LIMIT = 1000;

export function ArenaPrompt(): JSX.Element {
  const prompt = useArenaWorkshopStore(state => state.prompt);

  return (
    <WorkshopPrompt
      id="workshop-arena-prompt"
      label="Describe your arena"
      prompt={prompt}
      limit={ARENA_PROMPT_LIMIT}
      placeholder="Try a yard with a pillar or a raised platform with stairs"
      onPromptChange={useArenaWorkshopStore.getState().setPrompt}
      onMake={() => {
        useArenaWorkshopStore.getState().setResult({...standInArenaFor(prompt), madeFromPrompt: prompt});
      }}
    />
  );
}

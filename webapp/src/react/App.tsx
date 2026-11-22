import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {roomOfPage} from "@src/online/RoomOfPage";
import {loadLocalGameOfPage} from "@src/react/navigation/LoadLocalGameOfPage";
import {AmmoHud} from "@src/react/components/dom/ammo-hud/AmmoHud";
import {ConnectionNotice} from "@src/react/components/dom/connection-notice/ConnectionNotice";
import {GameMenu} from "@src/react/components/dom/game-menu/GameMenu";
import {HealthHud} from "@src/react/components/dom/health-hud/HealthHud";
import {PreRound} from "@src/react/components/dom/pre-round/PreRound";
import {RingHud} from "@src/react/components/dom/ring-hud/RingHud";
import {RoundBanner} from "@src/react/components/dom/round-banner/RoundBanner";
import {ScoreHud} from "@src/react/components/dom/score-hud/ScoreHud";
import {Workshop} from "@src/react/components/dom/workshop/Workshop";
import {ArenaCanvas} from "@src/react/components/three/arena-canvas/ArenaCanvas";
import type {JSX} from "react";
import {useEffect} from "react";

/** The game is the whole window, with the heads-up display over it. Menus will appear over it only when they are needed. */
export function App(): JSX.Element {
  useEffect(() => {
    if (roomOfPage() !== undefined) return undefined;

    window.addEventListener("popstate", loadHistoryPage);

    return () => {
      window.removeEventListener("popstate", loadHistoryPage);
    };
  }, []);

  return (
    <>
      <ArenaCanvas />

      <AmmoHud />

      <HealthHud />

      <ScoreHud />

      <RingHud />

      <RoundBanner />

      <ConnectionNotice />

      <Workshop />

      <PreRound />

      <GameMenu />
    </>
  );
}

function loadHistoryPage(): void {
  if (scenarioOfPage() === "practice") {
    loadLocalGameOfPage("main");
    return;
  }

  loadLocalGameOfPage(undefined);
}

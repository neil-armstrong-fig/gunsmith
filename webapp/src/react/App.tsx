import {AmmoHud} from "@src/react/components/dom/ammo-hud/AmmoHud";
import {HealthHud} from "@src/react/components/dom/health-hud/HealthHud";
import {RoundBanner} from "@src/react/components/dom/round-banner/RoundBanner";
import {ScoreHud} from "@src/react/components/dom/score-hud/ScoreHud";
import {ArenaCanvas} from "@src/react/components/three/arena-canvas/ArenaCanvas";
import type {JSX} from "react";

/** The game is the whole window, with the heads-up display over it. Menus will appear over it only when they are needed. */
export function App(): JSX.Element {
  return (
    <>
      <ArenaCanvas />

      <AmmoHud />

      <HealthHud />

      <ScoreHud />

      <RoundBanner />
    </>
  );
}

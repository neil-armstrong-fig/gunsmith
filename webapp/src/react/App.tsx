import {ArenaCanvas} from "@src/react/arena/ArenaCanvas";
import type {JSX} from "react";

export function App(): JSX.Element {
  return (
    <main className="h-screen w-screen">
      <ArenaCanvas />
    </main>
  );
}

import type {ScriptMode} from "@gunsmith/shared/config/repository/artifacts/file/html/executable/types/ScriptMode.ts";

/** The code of a script that runs, and how it runs. */
export interface ExecutableScript {
  code: string;
  scriptMode: ScriptMode;
}

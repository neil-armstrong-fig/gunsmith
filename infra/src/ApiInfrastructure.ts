import alchemy from "alchemy";
import {CloudflareStateStore} from "alchemy/state";
import {buildApiDatabase} from "@src/api-database/BuildApiDatabase";
import {buildApiWorker} from "@src/api-worker/BuildApiWorker";
import {secrets} from "@src/secrets/Secrets";

const app = await alchemy("gunsmith", {
  password: secrets.ALCHEMY_PASSWORD,
  noTrack: true,
  stateStore: scope => new CloudflareStateStore(scope, {scriptName: "gunsmith-alchemy-state"}),
});

const apiDatabase = await buildApiDatabase();
const apiWorker = await buildApiWorker(apiDatabase);

await app.finalize();

// eslint-disable-next-line no-console
console.log(`Configured API Worker: ${apiWorker.name}`);

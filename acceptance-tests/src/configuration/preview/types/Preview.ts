import type {WebServer} from "@src/configuration/preview/types/WebServer";

export interface Preview {
  webappUrl: string;
  webServers?: WebServer[];
}

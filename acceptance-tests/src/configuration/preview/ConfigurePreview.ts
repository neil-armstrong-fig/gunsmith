import type {Preview} from "@src/configuration/preview/types/Preview";
import {externalApiUrl} from "@src/configuration/preview/external-api/ExternalApiUrl";
import {previewPort} from "@src/configuration/preview/port/PreviewPort";
import {previewServers} from "@src/configuration/preview/servers/PreviewServers";

export function configurePreview(environment: NodeJS.ProcessEnv): Preview {
  if (environment["PREVIEW_ACCEPTANCE"] !== "1") {
    return {webappUrl: environment["WEBAPP_URL"] ?? "http://localhost:3000"};
  }

  const webappPort = previewPort("PREVIEW_PORT", environment["PREVIEW_PORT"], 3107);
  const webappUrl = `http://127.0.0.1:${webappPort}`;
  const apiUrl = externalApiUrl(environment);
  if (apiUrl !== undefined) {
    return {webappUrl, webServers: previewServers({webappPort, apiUrl})};
  }

  const apiPort = previewPort("PREVIEW_API_PORT", environment["PREVIEW_API_PORT"], 8788);
  if (apiPort === webappPort) {
    throw new Error("PREVIEW_PORT and PREVIEW_API_PORT must be different");
  }

  return {
    webappUrl,
    webServers: previewServers({webappPort, apiPort, apiUrl: `http://127.0.0.1:${apiPort}`}),
  };
}

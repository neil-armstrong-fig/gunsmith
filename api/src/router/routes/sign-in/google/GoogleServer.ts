import type {AuthorizationServer} from "oauth4webapi";

/** Google as an OAuth server, its endpoints written out (so there is no discovery request to fail). */
export const GOOGLE: AuthorizationServer = {
  issuer: "https://accounts.google.com",
  authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  token_endpoint: "https://oauth2.googleapis.com/token",
};

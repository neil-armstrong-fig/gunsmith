import type {FakeGoogleBehaviour} from "@src/sign-in/testing/types/FakeGoogleBehaviour";
import type {GoogleAuthorization} from "@src/sign-in/types/GoogleAuthorization";
import type {GoogleExchange} from "@src/sign-in/types/GoogleExchange";

/**
 * Google for a route's test (`SetupApiTests` mocks `googleAuthorizationUrl` and `googleSubjectOf` to hand out these). It keeps what it
 * was asked, so a test can see the state and verifier a route chose, and a test sets `behaviour` to make it fail.
 */
export class FakeGoogle {
  authorizations: GoogleAuthorization[] = [];
  exchanges: GoogleExchange[] = [];
  behaviour: FakeGoogleBehaviour = {};

  authorizationUrl = async (authorization: GoogleAuthorization): Promise<URL> => {
    this.authorizations.push(authorization);
    if (this.behaviour.failsToSendThePlayer) {
      throw new Error("the stand-in for Google would not build a URL");
    }

    return new URL(`https://google.test/authorize?state=${authorization.state}`);
  };

  subjectOf = async (exchange: GoogleExchange): Promise<string> => {
    this.exchanges.push(exchange);
    if (this.behaviour.failsToExchange) {
      throw new Error("the stand-in for Google refused the code");
    }

    return this.behaviour.subject ?? "google-sub-1";
  };

  reset = (): void => {
    this.authorizations = [];
    this.exchanges = [];
    this.behaviour = {};
  };
}

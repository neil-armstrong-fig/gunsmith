import {FakeGoogle} from "@src/sign-in/testing/FakeGoogle";

/** The one stand-in for Google every test shares; `SetupApiTests` resets it before each test. */
export const testGoogle = new FakeGoogle();

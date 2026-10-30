import test from "node:test";
import assert from "node:assert/strict";
import { parseMatterEntry } from "./oauth-legal-intake.ts";

test("a matter entry requires explicit contact consent and keeps the selected legal workflow", () => {
  const intake = parseMatterEntry({
    email: "client@example.org",
    provider: "google",
    returnTo: "https://legal.example.org/after-login",
    matterType: "deadline_follow_up",
    consentToContact: true,
  });

  assert.equal(intake.matterType, "deadline_follow_up");
  assert.throws(() => parseMatterEntry({ ...intake, consentToContact: false }));
});

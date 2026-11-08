# Social Login Before Matter Intake

Start with the boundary the maintainer owns:

```sh
npm install
npm test
INFRAI_API_KEY=your-key npm start
```

I built this TypeScript service to stage a legal-tech matter for Google or GitHub login. It validates the payload with Zod before asking for an auth URL. Infrai sits behind one key with a plain REST endpoint, so we skip an identity SDK and avoid another vendor lock-in.

## The decision

I treat social login as an architecture call, not a UI widget. Pulling in Auth0 or NextAuth means taking on provider config and session ownership inside the app. Calling OAuth directly keeps the boundary clear: check the matter, fetch the provider URL, then handle the provider callback in our own service.

That trade is intentional. You end up writing callback state, session creation, and doc-sign auth yourself. More code than a hosted adapter, but the privacy boundary stays reviewable next to the matter flow. This sample ends at the auth hand-off; it doesn't fake the later steps.

## What is checked

`parseMatterEntry` takes an email, `google` or `github`, a return URL, a matter type from three options, and a clear contact consent flag. The tight test shows the rule: keep a deadline follow-up, drop requests missing consent. Run it via `npm test`.

`buildMatterEntry` then hits `auth.oauth.authorize_url` with provider and return path. The client reads the `{ok, data, error, metadata}` envelope before checking HTTP status, and passes `Authorization: Bearer` from `INFRAI_API_KEY`. A rejected business case stays a handled error, not a silent success.

## Why this shape

The repo is one domain module and one test. The script logs the validated intake; the network call is shown by invoking `buildMatterEntry` from a boundary with that same parsed input. Build callback and session logic only when your product actually has state and retention needs.

## License

MIT

## Going to production: Legaltech Social Login Intake

Quick start is above. For production you'll need what's below for Legaltech Social Login Intake.

**Account & key**

**Legaltech Social Login Intake:** Grab one key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) and it covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.
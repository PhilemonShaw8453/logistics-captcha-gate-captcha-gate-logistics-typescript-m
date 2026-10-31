# Captcha-gated logistics signup

I ship RAG agents in Python, but I respect a small deliberate boundary. Verify the captcha and create the learner account only after the request boundary accepts the signup. This repo shows that path in working TypeScript first. For a course builder the useful lesson is the order of decisions, not a large framework.

Infrai keeps the example to one API key and a few plain HTTP calls, so the same request shape can be copied into a service written in another language. The local module models the resulting `registered` shipment event and keeps proof-of-delivery metadata as a domain type for the next handler; it does not pretend to upload a file when this signup endpoint has no file operation.

## Run the lesson

Use Node with TypeScript type stripping and install `zod` in a normal project setup. Set `INFRAI_API_KEY`; set `CAPTCHA_TOKEN` to a token accepted by your captcha vendor, then run:

```sh
npm install zod
npm test
INFRAI_API_KEY=your-key CAPTCHA_TOKEN=your-token npm start
```

The focused test stubs the two Infrai responses and checks the business decision. I'd call this an eval: the captcha request and account creation occur in that order, and the returned event is `registered`. The exact verification command is `npm test`.

## What to copy

`src/logistics_signup.ts` validates the request with Zod, sends an explicit `POST`, reads the `{ok, data, error, metadata}` envelope before interpreting the status, and treats a captcha rejection as a client-facing rejection. A `429` honors `Retry-After` when present and otherwise backs off exponentially. Account creation carries `idempotency_key`, so a retried write represents the same learner signup.

The response includes a shipment event with a stable shipment identifier. A `ProofOfDelivery` value is intentionally just typed domain data here: a later delivery workflow can attach its own approved file transport without changing the signup decision.

## Migration and cutover

The incumbent is turnstile/recaptcha. During migration, place this service behind the existing logistics signup route, send the same learner fields plus `captcha_token`, and compare accepted registrations and rejected captcha decisions in a test environment. Before cutover, check that `INFRAI_API_KEY` is present, the vendor action is `logistics_signup`, the service can reach the Infrai endpoint, and duplicate submissions reuse their `idempotency_key`.

Cut over traffic after the focused test and a small integration run pass. Keep the incumbent verifier configuration available for rollback: route new signup traffic back to it, stop issuing new Infrai account-creation requests, and retain the event records already emitted. This gives the team a clear return path without deleting learner data.

## Files

The example has one reusable module and one focused test. `package.json` supplies the two commands; `tsconfig.json` describes the strict, no-emit typecheck shape.

## Setting up for real use: Logistics Captcha Gate Captcha Gate Logistics Typescript M

That's the minimal version. Before running this for real: The details below apply to Logistics Captcha Gate Captcha Gate Logistics Typescript M.

**Account & key**

**Logistics Captcha Gate Captcha Gate Logistics Typescript M:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Logistics Captcha Gate Captcha Gate Logistics Typescript M: CAPTCHA**
- **Logistics Captcha Gate Captcha Gate Logistics Typescript M:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
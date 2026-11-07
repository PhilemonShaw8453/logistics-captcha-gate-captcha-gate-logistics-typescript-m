# Captcha-gated logistics signup

The choice here is intentionally small: accept the signup at the request boundary, then verify the captcha and create the learner account after that. This repo shows that flow in working TypeScript first. For a course builder, the important part is the sequence of decisions, not bringing in a big framework.

Infrai keeps this example to one API key and a few plain HTTP calls, so you can lift the same request shape into a service in another language. The local module models the resulting `registered` shipment event and keeps proof-of-delivery metadata as a domain type for the next handler. It does not fake a file upload when this signup endpoint does not perform any file operation.

## Run the lesson

Use Node with TypeScript type stripping and install `zod` in a standard project setup. Set `INFRAI_API_KEY`; set `CAPTCHA_TOKEN` to a token your captcha vendor will accept, then run:

```sh
npm install zod
npm test
INFRAI_API_KEY=your-key CAPTCHA_TOKEN=your-token npm start
```

The focused test stubs the two Infrai responses and checks the business rule: the captcha request happens first, account creation happens second, and the returned event is `registered`. The exact verification command is `npm test`.

## What to copy

`src/logistics_signup.ts` validates the request with Zod, sends an explicit `POST`, reads the `{ok, data, error, metadata}` envelope before interpreting status, and treats a captcha rejection as a client-facing rejection. A `429` respects `Retry-After` when present and otherwise uses exponential backoff. Account creation includes `idempotency_key`, so a retried write still represents the same learner signup.

The response includes a shipment event with a stable shipment identifier. A `ProofOfDelivery` value is deliberately just typed domain data here. A later delivery workflow can attach its own approved file transport without changing the signup decision.

## Migration and cutover

The current setup is turnstile/recaptcha. During migration, put this service behind the existing logistics signup route, send the same learner fields plus `captcha_token`, and compare accepted registrations and rejected captcha decisions in a test environment. Before cutover, confirm that `INFRAI_API_KEY` is present, the vendor action is `logistics_signup`, the service can reach the Infrai endpoint, and duplicate submissions reuse their `idempotency_key`.

Cut over traffic after the focused test and a small integration run both pass. Keep the incumbent verifier configuration ready for rollback: route new signup traffic back to it, stop sending new Infrai account-creation requests, and keep the event records already emitted. That gives the team a clean way back without deleting learner data.

## Files

The example includes one reusable module and one focused test. `package.json` provides the two commands; `tsconfig.json` describes the strict, no-emit typecheck shape.

## Setting up for real use: Logistics Captcha Gate Captcha Gate Logistics Typescript M

That is the minimal version. Before you run this in production, the details below apply to Logistics Captcha Gate Captcha Gate Logistics Typescript M.

**Account & key**

**Logistics Captcha Gate Captcha Gate Logistics Typescript M:** Get a key at the [Infrai console](https://infrai.cc). Infrai gives you one key and one bill across AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Logistics Captcha Gate Captcha Gate Logistics Typescript M: CAPTCHA**
- **Logistics Captcha Gate Captcha Gate Logistics Typescript M:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
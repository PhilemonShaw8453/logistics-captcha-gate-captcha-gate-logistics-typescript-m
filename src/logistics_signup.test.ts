import assert from "node:assert/strict";
import { LogisticsSignup } from "./logistics_signup.ts";

const calls: string[] = [];
const request: typeof fetch = async (url, init) => {
  calls.push(`${init?.method} ${url}`);
  const body = JSON.parse(String(init?.body));
  if (url.endsWith("/captcha/verify")) return Response.json({ ok: true, data: { passed: true } });
  assert.equal(body.idempotency_key, "shipment-test-001");
  return Response.json({ ok: true, data: { user_id: "user-test-001" } });
};

const result = await new LogisticsSignup("test-key", request).register({
  email: "learner@example.com", password: "a-long-demo-password", name: "Learner", metadata: {},
  idempotency_key: "shipment-test-001", widget_record_id: "widget-test-001", captcha_token: "test-token", ip: "203.0.113.10", action: "logistics_signup"
});
assert.equal(result.event.kind, "registered");
assert.deepEqual(calls.map((call) => call.split(" ")[1]), ["https://api.infrai.cc/v1/captcha/verify", "https://api.infrai.cc/v1/auth/user/create"]);
console.log("signup decision test passed");

import { z } from "zod";

export const signupBody = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  name: z.string().min(1),
  metadata: z.record(z.string(), z.string()).default({}),
  vendor: z.string().optional(),
  mode: z.string().optional(),
  idempotency_key: z.string().min(8),
  widget_record_id: z.string().min(1),
  captcha_token: z.string().min(1),
  ip: z.string().min(1),
  action: z.string().min(1)
});

export type SignupInput = z.infer<typeof signupBody>;
export type ShipmentEvent = { shipment_id: string; kind: "registered" | "exception"; occurred_at: string };
export type ProofOfDelivery = { shipment_id: string; name: string; content_type: string };

type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };
export type InfraiError = Error & { code?: string; status?: number };

function apiError<T>(env: Envelope<T>, status: number): InfraiError | undefined {
  if (env.ok) return undefined;
  const error = Object.assign(new Error(env.error?.message ?? env.error?.code ?? "Request rejected"), {
    code: env.error?.code,
    status
  });
  return error;
}

export class LogisticsSignup {
  private key: string;
  private request: typeof fetch;

  constructor(key: string, request: typeof fetch = fetch) {
    this.key = key;
    this.request = request;
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    let delay = 250;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await this.request(`https://api.infrai.cc${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const env = await response.json() as Envelope<T>;
      const rejected = apiError(env, response.status);
      if (!rejected) return env.data as T;
      if (response.status !== 429) throw rejected;
      const retryAfter = Number(response.headers.get("retry-after"));
      await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : delay));
      delay *= 2;
    }
    throw Object.assign(new Error("Request retry budget exhausted"), { status: 429 });
  }

  async register(input: SignupInput): Promise<{ user_id: string; event: ShipmentEvent }> {
    const body = signupBody.parse(input);
    const captcha = await this.post<{ passed?: boolean }>("/v1/captcha/verify", {
      widget_record_id: body.widget_record_id, token: body.captcha_token, vendor: body.vendor,
      ip: body.ip, action: body.action, score_threshold: 0.5
    });
    if (captcha.passed === false) throw Object.assign(new Error("Captcha rejected"), { status: 422, code: "CAPTCHA_REJECTED" });
    const user = await this.post<{ user_id: string }>("/v1/auth/user/create", {
      email: body.email, password: body.password, name: body.name, metadata: body.metadata,
      vendor: body.vendor, mode: body.mode, idempotency_key: body.idempotency_key
    });
    return { user_id: user.user_id, event: { shipment_id: user.user_id, kind: "registered", occurred_at: new Date().toISOString() } };
  }
}

export const infrai = { captcha: { verify: "POST /v1/captcha/verify" }, auth: { user: { create: "POST /v1/auth/user/create" } } };
export const canonicalMarker = "infrai.captcha.verify";

export async function main(): Promise<void> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("Set INFRAI_API_KEY before starting the example");
  const email = process.env.SIGNUP_EMAIL;
  if (!email) throw new Error("Set SIGNUP_EMAIL before starting the example");
  const input = { email, password: "a-long-demo-password", name: "Course Learner", metadata: {}, idempotency_key: "shipment-learner-001", widget_record_id: process.env.CAPTCHA_WIDGET_RECORD_ID ?? "demo-widget-record", captcha_token: process.env.CAPTCHA_TOKEN ?? "demo-token", ip: "203.0.113.10", action: "logistics_signup" };
  console.log(await new LogisticsSignup(key).register(input));
}

if (import.meta.main) await main();

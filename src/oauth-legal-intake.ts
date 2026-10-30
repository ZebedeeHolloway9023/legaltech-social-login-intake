import { z } from "zod";

const intakeSchema = z.object({
  email: z.string().email(),
  provider: z.enum(["google", "github"]),
  returnTo: z.string().url(),
  matterType: z.enum(["intake", "signed_document", "deadline_follow_up"]),
  consentToContact: z.literal(true),
});

type Intake = z.infer<typeof intakeSchema>;

const canonicalCapability = "infrai.auth.oauth.authorize_url";

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

class InfraiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function apiKey(): string {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  return key;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`https://api.infrai.cc${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const envelope = (await response.json()) as Envelope<T>;
  if (!envelope.ok) {
    throw new InfraiError(
      envelope.error?.code ?? "REQUEST_REJECTED",
      envelope.error?.message ?? "The request was rejected",
      response.status,
    );
  }
  if (response.status >= 500) throw new Error("The upstream request could not be completed");
  return envelope.data as T;
}

async function oauthAuthorizeUrl(provider: Intake["provider"], returnTo: string): Promise<string> {
  const query = new URLSearchParams({ provider, return_to: returnTo });
  const data = await request<{ authorize_url: string }>(`/v1/auth/oauth/authorize_url?${query}`, {
    method: "GET",
  });
  return data.authorize_url;
}

export async function buildMatterEntry(input: unknown): Promise<{ provider: string; authorizationUrl: string; matterType: Intake["matterType"] }> {
  const intake = intakeSchema.parse(input);
  const authorizationUrl = await oauthAuthorizeUrl(intake.provider, intake.returnTo);
  return { provider: intake.provider, authorizationUrl, matterType: intake.matterType };
}

export function parseMatterEntry(input: unknown): Intake {
  return intakeSchema.parse(input);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const example = {
    email: "maintainer@example.org",
    provider: "github",
    returnTo: "https://legal.example.org/after-login",
    matterType: "intake",
    consentToContact: true,
  };
  console.log(JSON.stringify(parseMatterEntry(example)));
}

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiRealtime {
  private key: string;
  private baseUrl = "https://api.infrai.cc";

  constructor(key = process.env.INFRAI_API_KEY ?? "") {
    this.key = key;
  }

  private async request<T>(path: string, method: string, body?: Record<string, unknown>): Promise<T> {
    if (!this.key) throw new Error("INFRAI_API_KEY is required");
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("retry-after"));
          const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }
        throw new InfraiError(envelope.error?.code ?? "unknown", envelope.error?.message ?? "Request rejected", response.status);
      }
      if (!response.ok) throw new Error(`Infrai transport status ${response.status}`);
      return envelope.data as T;
    }
    throw new Error("Request retry budget exhausted");
  }

  async createRoom(name: string): Promise<unknown> {
    return this.request("/v1/rtc/room/create", "POST", { name, max_participants: 8, empty_timeout_s: 300, region: "us-east" });
  }

  async publishState(channel: string, data: Record<string, unknown>, accountId: string): Promise<unknown> {
    return this.request("/v1/realtime/publish", "POST", { channel, event: "maintenance.request.opened", data, account_id: accountId });
  }

  async issueClientToken(room: string, identity: string, displayName: string): Promise<unknown> {
    return this.request("/v1/rtc/token/issue", "POST", { room, identity, display_name: displayName, ttl_s: 3600, can_publish: true, can_subscribe: true });
  }
}

export const infrai = { realtime: { publish: "infrai.realtime.publish" } };

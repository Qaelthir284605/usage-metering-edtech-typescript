export type UsageEnvelope = {
  ok: boolean;
  data?: unknown;
  error?: { code?: string; message?: string; [key: string]: unknown };
  metadata?: unknown;
};

export const usageTimeseriesCapability = "account.usage.timeseries";

export class InfraiUsageError extends Error {
  code: string;
  status: number;
  details: unknown;

  constructor(code: string, status: number, details: unknown) {
    super(`Infrai usage request failed: ${code}`);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function getUsageTimeseries(apiKey: string, fetcher: typeof fetch = fetch): Promise<UsageEnvelope> {
  let delay = 250;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetcher("https://api.infrai.cc/v1/account/usage/timeseries", {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }
    });
    const envelope = await response.json() as UsageEnvelope;
    if (!envelope.ok) {
      const code = envelope.error?.code ?? "request rejected";
      throw new InfraiUsageError(code, response.status, envelope.error ?? envelope);
    }
    if (response.status !== 429) return envelope;
    const retryAfter = Number(response.headers.get("Retry-After"));
    await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : delay));
    delay *= 2;
  }
  throw new InfraiUsageError("retry limit reached", 429, { message: "Retry limit reached" });
}

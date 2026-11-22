import { createHash, createHmac, randomUUID } from "crypto";

const SERVICE_TIMEOUT_MS = 15_000;

function getBackendUrl() {
  const backendUrl = process.env.VOTELY_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("VOTELY_BACKEND_URL chưa được cấu hình");
  }

  return backendUrl.replace(/\/+$/, "");
}

function getServiceSecret() {
  const secret = process.env.VOTELY_SERVICE_SECRET;

  if (!secret) {
    throw new Error("VOTELY_SERVICE_SECRET chưa được cấu hình");
  }

  return secret;
}

type BackendRequestOptions = {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  userUid?: string;
};

export async function requestVotelyBackend(
  endpoint: string,
  options: BackendRequestOptions = {}
) {
  const method = options.method ?? "GET";
  const requestBody = JSON.stringify(options.body ?? {});
  const timestamp = Date.now().toString();
  const requestId = randomUUID();
  const bodyHash = createHash("sha256").update(requestBody).digest("hex");
  const signaturePayload = [
    method,
    endpoint,
    timestamp,
    requestId,
    bodyHash,
    options.userUid ?? ""
  ].join("\n");
  const signature = createHmac("sha256", getServiceSecret())
    .update(signaturePayload)
    .digest("hex");

  const headers: Record<string, string> = {
    "X-Votely-Timestamp": timestamp,
    "X-Votely-Request-Id": requestId,
    "X-Votely-Signature": signature
  };

  if (options.userUid) {
    headers["X-Votely-User-Uid"] = options.userUid;
  }

  if (method === "POST") {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${getBackendUrl()}${endpoint}`, {
    method,
    headers,
    ...(method === "POST" ? { body: requestBody } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(SERVICE_TIMEOUT_MS)
  });
}

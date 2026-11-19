import { createHmac, timingSafeEqual } from "crypto";

export type PiUser = {
  uid: string;
  username: string;
};

type SessionPayload = PiUser & {
  exp: number;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET chưa được cấu hình");
  }

  return secret;
}

export function createPiSession(user: PiUser) {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
  };

  const encoded = Buffer
    .from(JSON.stringify(payload))
    .toString("base64url");

  const signature = createHmac("sha256", getSecret())
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

export function verifyPiSession(token: string): PiUser | null {
  try {
    const [encoded, signature] = token.split(".");

    if (!encoded || !signature) return null;

    const expected = createHmac("sha256", getSecret())
      .update(encoded)
      .digest();

    const received = Buffer.from(signature, "base64url");

    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SessionPayload;

    if (
      !payload.uid ||
      !payload.username ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      uid: payload.uid,
      username: payload.username
    };
  } catch {
    return null;
  }
}
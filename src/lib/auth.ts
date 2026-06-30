import { cookies } from "next/headers";

const COOKIE_NAME = "hbu_admin";

function getSecrets() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set. Add it to .env.");
  }
  // The session token is derived from the password, so changing the password
  // invalidates all existing sessions. Good enough for a single shared login.
  const secret = process.env.ADMIN_SESSION_SECRET ?? password;
  return { password, secret };
}

async function sign(value: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Buffer.from(sig).toString("hex");
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function verifyPassword(input: string) {
  const { password } = getSecrets();
  return safeEqual(input, password);
}

export async function createSession() {
  const { secret } = getSecrets();
  const token = await sign("admin", secret);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Validate the session cookie value. Usable from middleware (Edge). */
export async function isValidToken(token: string | undefined) {
  if (!token) return false;
  const { secret } = getSecrets();
  const expected = await sign("admin", secret);
  return safeEqual(token, expected);
}

export const ADMIN_COOKIE = COOKIE_NAME;

import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import * as db from "../../server/db";
import { sdk } from "../../server/_core/sdk";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return new Response(JSON.stringify({ error: "code and state are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // CSRF guard
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = new Map<string, string>();
  cookieHeader.split(";").forEach((cookie) => {
    const [key, ...rest] = cookie.trim().split("=");
    cookies.set(key, rest.join("="));
  });

  const { nonce } = decodeOAuthState(state);
  const expectedNonce = cookies.get(OAUTH_STATE_COOKIE);

  if (!nonce || nonce !== expectedNonce) {
    return new Response(JSON.stringify({ error: "invalid oauth state" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

    if (!userInfo.openId) {
      return new Response(JSON.stringify({ error: "openId missing from user info" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db.upsertUser({
      openId: userInfo.openId,
      name: userInfo.name || null,
      email: userInfo.email ?? null,
      loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: userInfo.name || "",
      expiresInMs: ONE_YEAR_MS,
    });

    // Redirect to home with session cookie
    const baseUrl = `${url.protocol}//${url.host}`;
    return new Response(null, {
      status: 302,
      headers: {
        "Location": baseUrl,
        "Set-Cookie": `${COOKIE_NAME}=${sessionToken}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${ONE_YEAR_MS / 1000}`,
      },
    });
  } catch (error) {
    console.error("[OAuth] Callback failed", error);
    return new Response(JSON.stringify({ error: "OAuth callback failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

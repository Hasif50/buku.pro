/** POST /admin/login — operator token -> signed cookie -> /admin. */
import { ADMIN_COOKIE, COOKIE_TTL_MS, signExpiry, type EnvLike } from "./_lib.js";

export const onRequestPost: PagesFunction = async (context) => {
  const env = context.env as EnvLike;
  const expected = env.ADMIN_DASHBOARD_TOKEN;
  if (!expected) {
    return new Response("Admin console not configured", { status: 503 });
  }
  const form = await context.request.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || token !== expected) {
    const url = new URL(context.request.url);
    return Response.redirect(`${url.origin}/admin?error=1`, 302);
  }
  const value = await signExpiry(Date.now() + COOKIE_TTL_MS, expected);
  return new Response(null, {
    status: 302,
    headers: {
      location: "/admin",
      "set-cookie": `${ADMIN_COOKIE}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(COOKIE_TTL_MS / 1000)}`,
    },
  });
};

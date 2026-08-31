/** GET /admin/logout — clear the admin cookie. */
import { ADMIN_COOKIE } from "./_lib.js";

export const onRequestGet: PagesFunction = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      location: "/admin",
      "set-cookie": `${ADMIN_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
    },
  });
};

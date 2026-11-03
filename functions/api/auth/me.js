import { getUserFromRequest, json } from "../_utils.js";

export async function onRequestGet({ request, env }) {
  const u = await getUserFromRequest(request, env);
  if (!u) return json({ error: "غير مسجل" }, 401);
  return json({ id: u.sub, name: u.name, email: u.email });
}
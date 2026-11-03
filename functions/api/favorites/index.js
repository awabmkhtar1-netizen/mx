import { getUserFromRequest, json } from "../_utils.js";

export async function onRequestGet({ request, env }) {
  const u = await getUserFromRequest(request, env);
  if (!u) return json([], 200);
  const { results } = await env.DB.prepare("SELECT property_id FROM favorites WHERE user_id = ?").bind(u.sub).all();
  return json((results || []).map(r => r.property_id));
}
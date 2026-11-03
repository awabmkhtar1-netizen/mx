import { getUserFromRequest, json } from "../_utils.js";

export async function onRequestPost({ request, env }) {
  const u = await getUserFromRequest(request, env);
  if (!u) return json({ error: "غير مسجل، سجّل دخول أولاً" }, 401);

  const { propertyId } = await request.json().catch(() => ({}));
  if (!propertyId) return json({ error: "معرّف العقار مطلوب" }, 400);

  await env.DB.prepare("INSERT OR IGNORE INTO favorites (id, user_id, property_id) VALUES (?, ?, ?)")
    .bind(crypto.randomUUID(), u.sub, String(propertyId)).run();

  return json({ ok: true, propertyId: String(propertyId) });
}
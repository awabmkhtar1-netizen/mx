import { getUserFromRequest, json } from "../_utils.js";

export async function onRequestDelete({ request, env }) {
  const u = await getUserFromRequest(request, env);
  if (!u) return json({ error: "غير مسجل" }, 401);

  const { propertyId } = await request.json().catch(() => ({}));
  if (!propertyId) return json({ error: "معرّف العقار مطلوب" }, 400);

  await env.DB.prepare("DELETE FROM favorites WHERE user_id = ? AND property_id = ?")
    .bind(u.sub, String(propertyId)).run();

  return json({ ok: true });
}
import { getUserFromRequest, json } from "../_utils.js";

export async function onRequestGet({ request, env }) {
  const u = await getUserFromRequest(request, env);
  if (!u) return json([], 200);

  // 1. جلب معرفات الشقق المفضلة
  const { results: favs } = await env.DB.prepare("SELECT property_id FROM favorites WHERE user_id = ?").bind(u.sub).all();
  if (!favs || favs.length === 0) return json([], 200);

  const ids = favs.map(f => f.property_id);
  const placeholders = ids.map(() => '?').join(',');

  // 2. جلب تفاصيل الشقق دي من جدول العقارات
  const { results } = await env.DB.prepare(
    `SELECT * FROM properties WHERE id IN (${placeholders})`
  ).bind(...ids).all();

  // 3. تنسيق البيانات عشان تتوافق مع الواجهة
  const formatted = results.map(p => Object.assign({}, p, {
    images: p.images ? JSON.parse(p.images) : [],
    elevator: p.elevator === 1,
    parking: p.parking === 1,
    longDesc: p.long_description
  }));

  return json(formatted);
}

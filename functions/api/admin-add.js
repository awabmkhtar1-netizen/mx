import { getUserFromRequest, json } from "./_utils.js";

export async function onRequestPost({ request, env }) {
  const u = await getUserFromRequest(request, env);
  if (!u) return json({ error: "غير مسجل" }, 401);

  // التأكد إن المستخدم أدمن
  const user = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(u.sub).first();
  if (!user || user.role !== 'admin') {
    return json({ error: "غير مصرح لك بالدخول (أنت لست مسؤول)" }, 403);
  }

  try {
    const data = await request.json();
    const id = crypto.randomUUID();

    await env.DB.prepare(
      `INSERT INTO properties (id, title, short, location, district, price, area, rooms, baths, floor, year, status, finishing, elevator, parking, description, long_description, images, video) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, data.title, data.short, data.location, data.district, data.price, data.area, data.rooms, data.baths, data.floor, data.year, data.status, data.finishing, data.elevator, data.parking, data.description, data.long_description, data.images, data.video
    ).run();

    return json({ ok: true, id });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

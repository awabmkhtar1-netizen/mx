import { hashPassword, signJWT, json, sessionCookie } from "../_utils.js";

export async function onRequestPost({ request, env }) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return json({ error: "جميع الحقول مطلوبة" }, 400);
    }
    if (String(password).length < 6) {
      return json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, 400);
    }
    const emailNorm = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return json({ error: "البريد الإلكتروني غير صالح" }, 400);
    }

    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(emailNorm).first();
    if (existing) {
      return json({ error: "البريد مستخدم بالفعل، جرّب تسجيل الدخول" }, 409);
    }

    const id = crypto.randomUUID();
    const password_hash = await hashPassword(password);
    const nameClean = String(name).trim().slice(0, 100);

    await env.DB.prepare(
      "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)"
    ).bind(id, nameClean, emailNorm, password_hash).run();

    const token = await signJWT(
      { sub: id, email: emailNorm, name: nameClean, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
      env.JWT_SECRET
    );

    return json({ user: { id, name: nameClean, email: emailNorm } }, 200, { "Set-Cookie": sessionCookie(token) });
  } catch (e) {
    return json({ error: "حدث خطأ في السيرفر: " + e.message }, 500);
  }
}
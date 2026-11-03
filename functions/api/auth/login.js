import { verifyPassword, signJWT, json, sessionCookie } from "../_utils.js";

export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return json({ error: "البريد وكلمة المرور مطلوبان" }, 400);
    
    const emailNorm = String(email).toLowerCase().trim();
    const row = await env.DB.prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?").bind(emailNorm).first();

    if (!row) return json({ error: "البريد أو كلمة المرور غير صحيحة" }, 401);
    
    const ok = await verifyPassword(password, row.password_hash);
    if (!ok) return json({ error: "البريد أو كلمة المرور غير صحيحة" }, 401);

    const token = await signJWT(
      { sub: row.id, email: row.email, name: row.name, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
      env.JWT_SECRET
    );

    return json({ user: { id: row.id, name: row.name, email: row.email } }, 200, { "Set-Cookie": sessionCookie(token) });
  } catch (e) {
    return json({ error: "حدث خطأ في السيرفر" }, 500);
  }
}
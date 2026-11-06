import { getUserFromRequest, json } from "../_utils.js";

export async function onRequestGet({ request, env }) {
  const u = await getUserFromRequest(request, env);
  if (!u) return json({ error: "غير مسجل" }, 401);
  
  // جلب الصلاحية من الداتا بيس
  const dbUser = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(u.sub).first();
  
  return json({ 
    id: u.sub, 
    name: u.name, 
    email: u.email, 
    role: dbUser ? dbUser.role : 'user' // لو مفيش صلاحية، يعتبره مستخدم عادي
  });
}

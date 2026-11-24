import { json } from "./_utils.js";

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 12;
    const offset = (page - 1) * limit;

    // 1. جلب العدد الإجمالي للشقق
    const countResult = await env.DB.prepare("SELECT COUNT(*) as total FROM properties").first();
    const total = countResult.total;

    // 2. جلب الشقق الخاصة بالصفحة الحالية فقط (12 شقة)
    const { results } = await env.DB.prepare(
      "SELECT * FROM properties ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();

    return json({
      data: results,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit) // حساب عدد الصفحات
      }
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

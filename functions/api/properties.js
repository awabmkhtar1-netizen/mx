import { json } from "./_utils.js";

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 12;
    const offset = (page - 1) * limit;

    // قراءة فلاتر السعر من الرابط
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");

    let whereClause = "WHERE 1=1";
    let bindings = [];

    if (minPrice && minPrice !== "") {
      whereClause += " AND price >= ?";
      bindings.push(parseInt(minPrice));
    }
    if (maxPrice && maxPrice !== "") {
      whereClause += " AND price <= ?";
      bindings.push(parseInt(maxPrice));
    }

    // 1. جلب العدد الإجمالي للشقق المطابقة للفلتر
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM properties ${whereClause}`
    ).bind(...bindings).first();
    const total = countResult.total;

    // 2. جلب الشقق الخاصة بالصفحة الحالية (مع الفلترة)
    const { results } = await env.DB.prepare(
      `SELECT * FROM properties ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all();

    return json({
      data: results,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

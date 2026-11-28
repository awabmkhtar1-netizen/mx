import { json } from "./_utils.js";

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 12;
    const offset = (page - 1) * limit;

    // قراءة كل الفلاتر من الرابط
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const search = url.searchParams.get("search");
    const district = url.searchParams.get("district");
    const rooms = url.searchParams.get("rooms");
    const status = url.searchParams.get("status");

    let whereClause = "WHERE 1=1";
    let bindings = [];

    if (minPrice) { whereClause += " AND price >= ?"; bindings.push(parseInt(minPrice)); }
    if (maxPrice) { whereClause += " AND price <= ?"; bindings.push(parseInt(maxPrice)); }
    if (district && district !== "الكل") { whereClause += " AND district = ?"; bindings.push(district); }
    if (status && status !== "الكل") { whereClause += " AND status = ?"; bindings.push(status); }
    if (rooms && rooms !== "الكل") { whereClause += " AND rooms = ?"; bindings.push(parseInt(rooms)); }
    
    // البحث بالكلام (في العنوان أو الوصف أو الموقع)
    if (search) {
      whereClause += " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)";
      const searchPattern = `%${search}%`;
      bindings.push(searchPattern, searchPattern, searchPattern);
    }

    // 1. جلب العدد الإجمالي
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM properties ${whereClause}`
    ).bind(...bindings).first();
    const total = countResult.total;

    // 2. جلب شقق الصفحة الحالية
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

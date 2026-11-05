import { json } from "./_utils.js";

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM properties ORDER BY created_at DESC"
    ).all();
    return json(results);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

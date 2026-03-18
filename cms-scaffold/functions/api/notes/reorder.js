// ============================================================
// PUT /api/notes/reorder
// Body: { items: [{ id: "note_0001", sort_order: 1 }, ...] }
// ============================================================

import { jsonResponse, errorResponse, now } from '../_utils.js';

export async function onRequestPut({ env, request }) {
  const body = await request.json();

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return errorResponse('items array required');
  }

  const timestamp = now();
  const statements = body.items.map(item =>
    env.DB.prepare(
      'UPDATE notes SET sort_order = ?, updated_at = ? WHERE id = ?'
    ).bind(item.sort_order, timestamp, item.id)
  );

  await env.DB.batch(statements);
  return jsonResponse({ reordered: body.items.length });
}

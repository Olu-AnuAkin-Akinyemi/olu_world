// ============================================================
// GET    /api/notes/:id  → single note
// PUT    /api/notes/:id  → update note fields
// DELETE /api/notes/:id  → delete note
// ============================================================

import { jsonResponse, errorResponse, now } from '../_utils.js';

export async function onRequestGet({ env, params }) {
  const item = await env.DB.prepare(
    'SELECT * FROM notes WHERE id = ?'
  ).bind(params.id).first();

  if (!item) return errorResponse('Not found', 404);
  return jsonResponse(item);
}

export async function onRequestPut({ env, params, request }) {
  const body = await request.json();
  const fields = [];
  const values = [];

  const allowed = [
    'title', 'date_display', 'note_type', 'description', 'full_content',
    'external_url', 'media_type', 'media_url', 'media_alt', 'sort_order', 'status'
  ];

  for (const key of allowed) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(body[key]);
    }
  }

  if (fields.length === 0) return errorResponse('No fields to update');

  fields.push('updated_at = ?');
  values.push(now());
  values.push(params.id);

  const result = await env.DB.prepare(
    `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  if (result.meta.changes === 0) return errorResponse('Not found', 404);
  return jsonResponse({ updated: true });
}

export async function onRequestDelete({ env, params }) {
  const result = await env.DB.prepare(
    'DELETE FROM notes WHERE id = ?'
  ).bind(params.id).run();

  if (result.meta.changes === 0) return errorResponse('Not found', 404);
  return jsonResponse({ deleted: true });
}

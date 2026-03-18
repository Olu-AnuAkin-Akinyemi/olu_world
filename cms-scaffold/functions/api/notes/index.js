// ============================================================
// GET  /api/notes  → list notes (default: published, sorted by sort_order)
//   ?status=all    → all notes (admin view)
//   ?type=press    → filter by note_type
// POST /api/notes  → create a new note
// ============================================================

import { jsonResponse, errorResponse, generateId, now } from '../_utils.js';

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status') || 'published';
  const typeFilter = url.searchParams.get('type');

  let query = 'SELECT * FROM notes';
  const conditions = [];
  const params = [];

  if (statusFilter !== 'all') {
    conditions.push('status = ?');
    params.push(statusFilter);
  }
  if (typeFilter) {
    conditions.push('note_type = ?');
    params.push(typeFilter);
  }
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY sort_order ASC';

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return jsonResponse(results);
}

export async function onRequestPost({ env, request }) {
  const body = await request.json();

  if (!body.title || !body.note_type || !body.description) {
    return errorResponse('Required: title, note_type, description');
  }
  if (!['written', 'audio', 'video', 'press'].includes(body.note_type)) {
    return errorResponse('note_type must be: written, audio, video, or press');
  }
  if (body.media_type && !['image', 'audio', 'video'].includes(body.media_type)) {
    return errorResponse('media_type must be: image, audio, or video');
  }

  const id = generateId();
  const timestamp = now();

  await env.DB.prepare(`
    INSERT INTO notes
      (id, title, date_display, note_type, description, full_content, external_url,
       media_type, media_url, media_alt, sort_order, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.title,
    body.date_display || '',
    body.note_type,
    body.description,
    body.full_content || null,
    body.external_url || null,
    body.media_type || null,
    body.media_url || null,
    body.media_alt || null,
    body.sort_order || 0,
    body.status || 'draft',
    timestamp,
    timestamp
  ).run();

  return jsonResponse({ id }, 201);
}

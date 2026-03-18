// ============================================================
// Shared utilities for API routes
// ============================================================

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function generateId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

export function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

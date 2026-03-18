// ============================================================
// POST /api/media/upload
// Accepts a file upload from the admin form.
// Stores in Cloudflare R2 bucket and returns the public URL.
//
// For images: if CF_IMAGES_ACCOUNT_ID is set, uploads to
// Cloudflare Images instead (auto-generates responsive variants).
// Otherwise falls back to R2.
//
// Wrangler bindings needed:
//   [[r2_buckets]]
//   binding = "MEDIA"
//   bucket_name = "oluanuakin-media"
//
// Optional (for Cloudflare Images):
//   CF_IMAGES_ACCOUNT_ID = "your-account-id"
//   CF_IMAGES_API_TOKEN  = "your-api-token"
// ============================================================

import { jsonResponse, errorResponse } from '../_utils.js';

// Max file sizes (in bytes)
const MAX_IMAGE = 10 * 1024 * 1024;  // 10MB
const MAX_AUDIO = 50 * 1024 * 1024;  // 50MB
const MAX_VIDEO = 200 * 1024 * 1024; // 200MB

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm'],
  video: ['video/mp4', 'video/webm', 'video/quicktime']
};

function getMediaCategory(mimeType) {
  for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
    if (types.includes(mimeType)) return category;
  }
  return null;
}

export async function onRequestPost({ env, request }) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return errorResponse('No file provided. Send as multipart form with field name "file".');
  }

  const category = getMediaCategory(file.type);
  if (!category) {
    return errorResponse(`Unsupported file type: ${file.type}`);
  }

  // Check file size
  const maxSize = { image: MAX_IMAGE, audio: MAX_AUDIO, video: MAX_VIDEO }[category];
  if (file.size > maxSize) {
    return errorResponse(`File too large. Max for ${category}: ${maxSize / 1024 / 1024}MB`);
  }

  // Generate a unique key
  const ext = file.name.split('.').pop() || 'bin';
  const key = `${category}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  // --- Cloudflare Images path (images only, if configured) ---
  if (category === 'image' && env.CF_IMAGES_ACCOUNT_ID && env.CF_IMAGES_API_TOKEN) {
    const cfForm = new FormData();
    cfForm.append('file', file);

    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CF_IMAGES_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.CF_IMAGES_API_TOKEN}` },
        body: cfForm
      }
    );

    const cfData = await cfResponse.json();
    if (!cfData.success) {
      return errorResponse('Cloudflare Images upload failed: ' + JSON.stringify(cfData.errors), 502);
    }

    return jsonResponse({
      media_type: 'image',
      media_url: cfData.result.variants[0], // Default variant URL
      image_id: cfData.result.id,           // Store this if you want variant control later
      filename: file.name
    });
  }

  // --- R2 path (all file types, or images when CF Images isn't configured) ---
  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name, category }
  });

  // R2 public URL depends on your custom domain or R2 public access config.
  // Pattern: https://media.oluanuakin.me/{key}
  // Set MEDIA_PUBLIC_URL in your env vars.
  const publicUrl = `${env.MEDIA_PUBLIC_URL || '/media'}/${key}`;

  return jsonResponse({
    media_type: category,
    media_url: publicUrl,
    filename: file.name
  });
}

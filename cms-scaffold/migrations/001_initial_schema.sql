-- ============================================================
-- CMS Schema — 001_initial_schema.sql
-- Scope: Notes/Log section only.
-- Run: npx wrangler d1 execute oluanuakin-cms --file=./migrations/001_initial_schema.sql
-- Local dev: add --local flag
-- ============================================================

CREATE TABLE IF NOT EXISTS notes (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),

  -- Display fields (visible in the feed)
  title         TEXT NOT NULL,
  date_display  TEXT NOT NULL,                -- Human-readable: "Apr 2025", "Mar 2026"
  note_type     TEXT NOT NULL CHECK (note_type IN ('written', 'audio', 'video', 'press')),
  description   TEXT NOT NULL,                -- Short preview text shown in the feed row

  -- Overlay content (shown when entry is clicked)
  full_content  TEXT,                         -- Sanitized HTML for the overlay body
  external_url  TEXT,                         -- Link out (e.g. Wavy Magazine article URL)

  -- Media attachments
  -- For images: image within a written note, or a photo for a handwritten piece
  -- For audio: voice memo file (uploaded to CF Stream or R2)
  -- For video: embed URL (Cloudflare Stream, YouTube, Vimeo)
  -- media_type tells the build script how to render the attachment
  media_type    TEXT CHECK (media_type IN ('image', 'audio', 'video') OR media_type IS NULL),
  media_url     TEXT,                         -- URL to the media file or embed
  media_alt     TEXT,                         -- Alt text for images, title for audio/video

  -- Ordering and status
  sort_order    INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),

  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notes_status_sort ON notes(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_notes_type ON notes(note_type);

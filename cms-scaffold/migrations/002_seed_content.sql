-- ============================================================
-- Seed Data — 002_seed_content.sql
-- Run AFTER 001_initial_schema.sql
-- npx wrangler d1 execute oluanuakin-cms --file=./migrations/002_seed_content.sql
-- ============================================================

-- Existing published entry (currently hardcoded in index.html)
INSERT INTO notes (id, title, date_display, note_type, description, full_content, external_url, sort_order, status) VALUES (
  'note_0001',
  'Channeling Sound and Spirit Across Borders',
  'Apr 2025',
  'press',
  'Featured in Wavy Magazine — on self-expression over validation, creative process, and the vision beyond music.',
  '<p>Featured in <strong>Wavy Magazine</strong>, April 2025.</p><blockquote class="note-press-quote">"I prioritize self-expression, empowerment, and inspiration rather than pursuing validation. My sound is a rainbow — addressing themes of self-love, memory, and human connection."</blockquote><p>The interview covers the journey from Saint Paul, Minnesota to Guatemala, creative philosophy rooted in spiritual practice, and a vision expanding into film, anime, and television scoring.</p><p class="note-press-link-wrap"><a href="https://www.wavymagazine.com/olu-anuakin-channeling-sound-and-spirit-across-borders" target="_blank" rel="noopener" class="note-press-link">Read full article on Wavy Magazine &rarr;</a></p>',
  'https://www.wavymagazine.com/olu-anuakin-channeling-sound-and-spirit-across-borders',
  1,
  'published'
);

-- Planned entries (drafts — publish when ready)

INSERT INTO notes (id, title, date_display, note_type, description, media_type, sort_order, status) VALUES (
  'note_0002',
  'What AFTERGLOW Actually Means',
  '',
  'written',
  'Handwritten reflection on the project''s origin.',
  'image',
  2,
  'draft'
);

INSERT INTO notes (id, title, date_display, note_type, description, media_type, sort_order, status) VALUES (
  'note_0003',
  'Collage — Using Your Hands, Not a Screen',
  '',
  'video',
  'Process video: how the gallery pieces come together.',
  'video',
  3,
  'draft'
);

INSERT INTO notes (id, title, date_display, note_type, description, media_type, sort_order, status) VALUES (
  'note_0004',
  'WTFYA — Why It Even Exists',
  '',
  'audio',
  'Voice memo on the story behind the track.',
  'audio',
  4,
  'draft'
);

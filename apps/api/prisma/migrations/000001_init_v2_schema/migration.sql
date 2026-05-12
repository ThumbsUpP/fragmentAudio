CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE processing_job_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE translation_target_type AS ENUM ('VIDEO', 'SEGMENT', 'WORD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  source_url TEXT,
  source_language TEXT NOT NULL DEFAULT 'zh',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON videos(created_at);

CREATE TABLE IF NOT EXISTS processing_jobs (
  id TEXT PRIMARY KEY,
  video_id TEXT REFERENCES videos(id) ON DELETE SET NULL,
  status processing_job_status NOT NULL DEFAULT 'PENDING',
  step TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS processing_jobs_status_idx ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS processing_jobs_video_id_idx ON processing_jobs(video_id);

CREATE TABLE IF NOT EXISTS alignments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'stable-ts',
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS alignments_video_id_idx ON alignments(video_id);

CREATE TABLE IF NOT EXISTS segments (
  id TEXT PRIMARY KEY,
  alignment_id TEXT NOT NULL REFERENCES alignments(id) ON DELETE CASCADE,
  external_segment_id TEXT,
  index INTEGER NOT NULL,
  text TEXT NOT NULL,
  start DOUBLE PRECISION NOT NULL,
  "end" DOUBLE PRECISION NOT NULL,
  UNIQUE(alignment_id, index)
);
CREATE INDEX IF NOT EXISTS segments_alignment_id_idx ON segments(alignment_id);

CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  segment_id TEXT NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  index INTEGER NOT NULL,
  text TEXT NOT NULL,
  pinyin TEXT,
  start DOUBLE PRECISION NOT NULL,
  "end" DOUBLE PRECISION NOT NULL,
  UNIQUE(segment_id, index)
);
CREATE INDEX IF NOT EXISTS words_segment_id_idx ON words(segment_id);

CREATE TABLE IF NOT EXISTS translations (
  id TEXT PRIMARY KEY,
  target_type translation_target_type NOT NULL,
  language TEXT NOT NULL,
  text TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  segment_id TEXT REFERENCES segments(id) ON DELETE CASCADE,
  word_id TEXT REFERENCES words(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (target_type = 'VIDEO' AND video_id IS NOT NULL AND segment_id IS NULL AND word_id IS NULL) OR
    (target_type = 'SEGMENT' AND video_id IS NULL AND segment_id IS NOT NULL AND word_id IS NULL) OR
    (target_type = 'WORD' AND video_id IS NULL AND segment_id IS NULL AND word_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS translations_target_language_idx ON translations(target_type, language);
CREATE INDEX IF NOT EXISTS translations_video_id_idx ON translations(video_id);
CREATE INDEX IF NOT EXISTS translations_segment_id_idx ON translations(segment_id);
CREATE INDEX IF NOT EXISTS translations_word_id_idx ON translations(word_id);

CREATE TABLE IF NOT EXISTS grammar_explanations (
  id TEXT PRIMARY KEY,
  segment_id TEXT NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'en',
  answer_markdown TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(segment_id, language)
);
CREATE INDEX IF NOT EXISTS grammar_explanations_segment_id_idx ON grammar_explanations(segment_id);

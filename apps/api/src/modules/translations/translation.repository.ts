import { pool } from "../../db/pool.js";
import { createId } from "../../shared/ids.js";
import type { CreateTranslationInput, TranslationDetail, TranslationTargetType } from "./translation.types.js";

interface TranslationRow {
  id: string;
  target_type: TranslationTargetType;
  language: string;
  text: string;
  provider: string | null;
  model: string | null;
  video_id: string | null;
  segment_id: string | null;
  word_id: string | null;
  created_at: Date;
  updated_at: Date;
}

const mapTranslation = (row: TranslationRow): TranslationDetail => ({
  id: row.id,
  targetType: row.target_type,
  language: row.language,
  text: row.text,
  provider: row.provider,
  model: row.model,
  videoId: row.video_id,
  segmentId: row.segment_id,
  wordId: row.word_id,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

export class TranslationRepository {
  async listForVideo(videoId: string, language?: string): Promise<TranslationDetail[]> {
    return this.listByTarget("VIDEO", "video_id", videoId, language);
  }

  async listForSegment(segmentId: string, language?: string): Promise<TranslationDetail[]> {
    return this.listByTarget("SEGMENT", "segment_id", segmentId, language);
  }

  async listForWord(wordId: string, language?: string): Promise<TranslationDetail[]> {
    return this.listByTarget("WORD", "word_id", wordId, language);
  }

  async createForVideo(videoId: string, input: CreateTranslationInput): Promise<TranslationDetail> {
    return this.create("VIDEO", input, { videoId });
  }

  async createForSegment(segmentId: string, input: CreateTranslationInput): Promise<TranslationDetail> {
    return this.create("SEGMENT", input, { segmentId });
  }

  async createForWord(wordId: string, input: CreateTranslationInput): Promise<TranslationDetail> {
    return this.create("WORD", input, { wordId });
  }

  private async listByTarget(
    targetType: TranslationTargetType,
    targetColumn: "video_id" | "segment_id" | "word_id",
    targetId: string,
    language?: string
  ): Promise<TranslationDetail[]> {
    const params = language ? [targetId, language] : [targetId];
    const languageClause = language ? "AND language = $2" : "";
    const result = await pool.query<TranslationRow>(
      `SELECT id, target_type, language, text, provider, model, video_id, segment_id, word_id, created_at, updated_at
       FROM translations
       WHERE target_type = '${targetType}'
         AND ${targetColumn} = $1
         ${languageClause}
       ORDER BY created_at DESC`,
      params
    );

    return result.rows.map(mapTranslation);
  }

  private async create(
    targetType: TranslationTargetType,
    input: CreateTranslationInput,
    target: { videoId?: string; segmentId?: string; wordId?: string }
  ): Promise<TranslationDetail> {
    const id = createId("translation");
    const result = await pool.query<TranslationRow>(
      `INSERT INTO translations (
         id, target_type, language, text, provider, model, video_id, segment_id, word_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, target_type, language, text, provider, model, video_id, segment_id, word_id, created_at, updated_at`,
      [
        id,
        targetType,
        input.language,
        input.text,
        input.provider,
        input.model,
        target.videoId ?? null,
        target.segmentId ?? null,
        target.wordId ?? null,
      ]
    );

    return mapTranslation(result.rows[0]);
  }
}

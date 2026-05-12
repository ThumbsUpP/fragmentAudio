import { pool } from "../../db/pool.js";
import { createId } from "../../shared/ids.js";
import type { CreateGrammarExplanationInput, GrammarExplanationDetail } from "./grammar.types.js";

interface GrammarExplanationRow {
  id: string;
  segment_id: string;
  language: string;
  answer_markdown: string;
  provider: string | null;
  model: string | null;
  created_at: Date;
  updated_at: Date;
}

const mapGrammarExplanation = (row: GrammarExplanationRow): GrammarExplanationDetail => ({
  id: row.id,
  segmentId: row.segment_id,
  language: row.language,
  answerMarkdown: row.answer_markdown,
  provider: row.provider,
  model: row.model,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

export class GrammarRepository {
  async getForSegment(segmentId: string, language: string): Promise<GrammarExplanationDetail | null> {
    const result = await pool.query<GrammarExplanationRow>(
      `SELECT id, segment_id, language, answer_markdown, provider, model, created_at, updated_at
       FROM grammar_explanations
       WHERE segment_id = $1 AND language = $2`,
      [segmentId, language]
    );

    const row = result.rows[0];
    return row ? mapGrammarExplanation(row) : null;
  }

  async createForSegment(
    segmentId: string,
    input: CreateGrammarExplanationInput
  ): Promise<GrammarExplanationDetail> {
    const id = createId("grammar");
    const result = await pool.query<GrammarExplanationRow>(
      `INSERT INTO grammar_explanations (
         id, segment_id, language, answer_markdown, provider, model
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, segment_id, language, answer_markdown, provider, model, created_at, updated_at`,
      [id, segmentId, input.language, input.answerMarkdown, input.provider, input.model]
    );

    return mapGrammarExplanation(result.rows[0]);
  }
}

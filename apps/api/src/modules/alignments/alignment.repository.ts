import { pool } from "../../db/pool.js";
import { createId } from "../../shared/ids.js";
import type { PaginationParams } from "../../shared/validation/pagination.js";
import type { AlignmentDetail, SegmentDto, WordDto } from "./alignment.types.js";

interface AlignmentRow {
  id: string;
  video_id: string;
  provider: string;
  model: string | null;
  created_at: Date;
  updated_at: Date;
}

interface SegmentRow {
  id: string;
  external_segment_id: string | null;
  index: number;
  text: string;
  start: number;
  end: number;
}

interface WordRow {
  id: string;
  segment_id: string;
  index: number;
  text: string;
  pinyin: string | null;
  start: number;
  end: number;
}

const mapWord = (row: WordRow): WordDto => ({
  id: row.id,
  index: row.index,
  text: row.text,
  pinyin: row.pinyin,
  start: row.start,
  end: row.end,
});

const mapSegment = (row: SegmentRow, words?: WordDto[]): SegmentDto => ({
  id: row.id,
  externalSegmentId: row.external_segment_id,
  index: row.index,
  text: row.text,
  start: row.start,
  end: row.end,
  ...(words ? { words } : {}),
});

const mapAlignment = (row: AlignmentRow, segments: SegmentDto[]): AlignmentDetail => ({
  id: row.id,
  videoId: row.video_id,
  provider: row.provider,
  model: row.model,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
  segments,
});

export class AlignmentRepository {
  async createAlignment(videoId: string, provider: string, model: string | null): Promise<string> {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO alignments (id, video_id, provider, model)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [createId("ali"), videoId, provider, model]
    );
    return result.rows[0].id;
  }

  async createSegmentsAndWords(alignmentId: string, segments: Array<{ externalSegmentId: string | null; index: number; text: string; start: number; end: number; words: Array<{ index: number; text: string; pinyin: string | null; start: number; end: number }> }>): Promise<void> {
    for (const segment of segments) {
      const segmentResult = await pool.query<{ id: string }>(
        `INSERT INTO segments (id, alignment_id, external_segment_id, index, text, start, "end")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [createId("seg"), alignmentId, segment.externalSegmentId, segment.index, segment.text, segment.start, segment.end]
      );
      const segmentId = segmentResult.rows[0].id;

      for (const word of segment.words) {
        await pool.query(
          `INSERT INTO words (id, segment_id, index, text, pinyin, start, "end")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [createId("wrd"), segmentId, word.index, word.text, word.pinyin, word.start, word.end]
        );
      }
    }
  }
  async getLatestAlignmentForVideo(videoId: string): Promise<AlignmentDetail | null> {
    const alignmentResult = await pool.query<AlignmentRow>(
      `SELECT id, video_id, provider, model, created_at, updated_at
       FROM alignments
       WHERE video_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [videoId]
    );
    const alignment = alignmentResult.rows[0];

    if (!alignment) {
      return null;
    }

    const segments = await this.listSegmentsForAlignment(alignment.id, { limit: 10_000, offset: 0 }, true);
    return mapAlignment(alignment, segments);
  }

  async listSegmentsForVideo(videoId: string, pagination: PaginationParams): Promise<SegmentDto[]> {
    const alignmentResult = await pool.query<{ id: string }>(
      `SELECT id FROM alignments WHERE video_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [videoId]
    );
    const alignment = alignmentResult.rows[0];

    if (!alignment) {
      return [];
    }

    return this.listSegmentsForAlignment(alignment.id, pagination, false);
  }

  async countSegmentsForVideo(videoId: string): Promise<number> {
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM segments s
       JOIN alignments a ON a.id = s.alignment_id
       WHERE a.video_id = $1
         AND a.id = (
           SELECT id FROM alignments WHERE video_id = $1 ORDER BY created_at DESC LIMIT 1
         )`,
      [videoId]
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async getSegmentById(segmentId: string): Promise<SegmentDto | null> {
    const result = await pool.query<SegmentRow>(
      `SELECT id, external_segment_id, index, text, start, "end"
       FROM segments
       WHERE id = $1`,
      [segmentId]
    );

    const row = result.rows[0];
    return row ? mapSegment(row) : null;
  }

  private async listSegmentsForAlignment(
    alignmentId: string,
    { limit, offset }: PaginationParams,
    includeWords: boolean
  ): Promise<SegmentDto[]> {
    const segmentResult = await pool.query<SegmentRow>(
      `SELECT id, external_segment_id, index, text, start, "end"
       FROM segments
       WHERE alignment_id = $1
       ORDER BY index ASC
       LIMIT $2 OFFSET $3`,
      [alignmentId, limit, offset]
    );

    if (!includeWords || segmentResult.rows.length === 0) {
      return segmentResult.rows.map((segment) => mapSegment(segment));
    }

    const segmentIds = segmentResult.rows.map((segment) => segment.id);
    const wordResult = await pool.query<WordRow>(
      `SELECT id, segment_id, index, text, pinyin, start, "end"
       FROM words
       WHERE segment_id = ANY($1)
       ORDER BY segment_id, index ASC`,
      [segmentIds]
    );

    const wordsBySegmentId = new Map<string, WordDto[]>();
    for (const word of wordResult.rows) {
      const current = wordsBySegmentId.get(word.segment_id) ?? [];
      current.push(mapWord(word));
      wordsBySegmentId.set(word.segment_id, current);
    }

    return segmentResult.rows.map((segment) => mapSegment(segment, wordsBySegmentId.get(segment.id) ?? []));
  }
}

import { pool } from "../../db/pool.js";
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

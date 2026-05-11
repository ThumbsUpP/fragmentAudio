import { pool } from "../../db/pool.js";
import { createId } from "../../shared/ids.js";
import type { PaginationParams } from "../../shared/validation/pagination.js";
import type { CreateVideoInput, VideoDetail, VideoSummary } from "./video.types.js";

interface VideoSummaryRow {
  id: string;
  external_id: string;
  title: string;
  source_url: string | null;
  source_language: string;
  created_at: Date;
  updated_at: Date;
  latest_job_status: string | null;
  alignment_count: string;
  segment_count: string;
  latest_alignment_id: string | null;
}

const mapVideo = (row: VideoSummaryRow): VideoDetail => ({
  id: row.id,
  externalId: row.external_id,
  title: row.title,
  sourceUrl: row.source_url,
  sourceLanguage: row.source_language,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
  latestJobStatus: row.latest_job_status,
  alignmentCount: Number(row.alignment_count),
  segmentCount: Number(row.segment_count),
  latestAlignmentId: row.latest_alignment_id,
});

const videoSelect = `
  SELECT
    v.id,
    v.external_id,
    v.title,
    v.source_url,
    v.source_language,
    v.created_at,
    v.updated_at,
    latest_job.status::text AS latest_job_status,
    COUNT(DISTINCT a.id)::text AS alignment_count,
    COUNT(DISTINCT s.id)::text AS segment_count,
    latest_alignment.id AS latest_alignment_id
  FROM videos v
  LEFT JOIN LATERAL (
    SELECT id, status
    FROM processing_jobs pj
    WHERE pj.video_id = v.id
    ORDER BY pj.created_at DESC
    LIMIT 1
  ) latest_job ON true
  LEFT JOIN LATERAL (
    SELECT id
    FROM alignments la
    WHERE la.video_id = v.id
    ORDER BY la.created_at DESC
    LIMIT 1
  ) latest_alignment ON true
  LEFT JOIN alignments a ON a.video_id = v.id
  LEFT JOIN segments s ON s.alignment_id = a.id
`;

export class VideoRepository {
  async listVideos({ limit, offset }: PaginationParams): Promise<VideoSummary[]> {
    const result = await pool.query<VideoSummaryRow>(
      `${videoSelect}
       GROUP BY v.id, latest_job.status, latest_alignment.id
       ORDER BY v.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows.map(mapVideo);
  }

  async countVideos(): Promise<number> {
    const result = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM videos");
    return Number(result.rows[0]?.count ?? 0);
  }

  async getVideoById(id: string): Promise<VideoDetail | null> {
    const result = await pool.query<VideoSummaryRow>(
      `${videoSelect}
       WHERE v.id = $1
       GROUP BY v.id, latest_job.status, latest_alignment.id`,
      [id]
    );

    const row = result.rows[0];
    return row ? mapVideo(row) : null;
  }

  async createVideo(input: CreateVideoInput): Promise<VideoDetail> {
    const id = createId("video");
    await pool.query(
      `INSERT INTO videos (id, external_id, title, source_url, source_language)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, input.externalId, input.title, input.sourceUrl ?? null, input.sourceLanguage ?? "zh"]
    );

    const video = await this.getVideoById(id);
    if (!video) {
      throw new Error("Created video could not be loaded");
    }

    return video;
  }
}

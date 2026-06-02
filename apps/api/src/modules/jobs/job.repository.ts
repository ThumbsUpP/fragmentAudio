import { pool } from "../../db/pool.js";
import type { PaginationParams } from "../../shared/validation/pagination.js";
import type { JobSummary } from "./job.types.js";

interface JobRow {
  id: string;
  video_id: string | null;
  video_title: string | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  step: string | null;
  error: string | null;
  created_at: Date;
  updated_at: Date;
}

const mapJob = (row: JobRow): JobSummary => ({
  id: row.id,
  videoId: row.video_id,
  videoTitle: row.video_title,
  status: row.status,
  step: row.step,
  error: row.error,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

export class JobRepository {
  async createJob(id: string, videoId: string): Promise<JobSummary> {
    const result = await pool.query<JobRow>(
      `INSERT INTO processing_jobs (id, video_id, status, step)
       VALUES ($1, $2, 'PROCESSING', 'UPLOADED')
       RETURNING id, video_id, null::text AS video_title, status, step, error, created_at, updated_at`,
      [id, videoId]
    );

    return mapJob(result.rows[0]);
  }

  async updateJobStatus(id: string, status: JobRow["status"], step: string, error: string | null = null): Promise<void> {
    await pool.query(
      `UPDATE processing_jobs SET status = $2, step = $3, error = $4, updated_at = NOW() WHERE id = $1`,
      [id, status, step, error]
    );
  }

  async listJobs({ limit, offset }: PaginationParams): Promise<JobSummary[]> {
    const result = await pool.query<JobRow>(
      `SELECT pj.id, pj.video_id, v.title AS video_title, pj.status, pj.step, pj.error, pj.created_at, pj.updated_at
       FROM processing_jobs pj
       LEFT JOIN videos v ON v.id = pj.video_id
       ORDER BY pj.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows.map(mapJob);
  }

  async countJobs(): Promise<number> {
    const result = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM processing_jobs");
    return Number(result.rows[0]?.count ?? 0);
  }

  async getJobById(id: string): Promise<JobSummary | null> {
    const result = await pool.query<JobRow>(
      `SELECT pj.id, pj.video_id, v.title AS video_title, pj.status, pj.step, pj.error, pj.created_at, pj.updated_at
       FROM processing_jobs pj
       LEFT JOIN videos v ON v.id = pj.video_id
       WHERE pj.id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? mapJob(row) : null;
  }
}

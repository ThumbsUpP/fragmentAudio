import { badRequest, notFound } from "../../shared/http/errors.js";
import { createId } from "../../shared/ids.js";
import { AlignmentRepository } from "../alignments/alignment.repository.js";
import { JobRepository } from "../jobs/job.repository.js";
import type { PaginationParams } from "../../shared/validation/pagination.js";
import { unlink } from "node:fs/promises";
import { VideoRepository } from "./video.repository.js";
import { StableTsClient } from "./stableTs.client.js";
import type { CreateVideoInput } from "./video.types.js";

export class VideoService {
  constructor(
    private readonly repository = new VideoRepository(),
    private readonly jobRepository = new JobRepository(),
    private readonly alignmentRepository = new AlignmentRepository(),
    private readonly stableTsClient = new StableTsClient()
  ) {}

  async listVideos(pagination: PaginationParams) {
    const [items, total] = await Promise.all([
      this.repository.listVideos(pagination),
      this.repository.countVideos(),
    ]);

    return {
      items,
      pagination: {
        ...pagination,
        total,
      },
    };
  }

  async getVideo(id: string) {
    const video = await this.repository.getVideoById(id);
    if (!video) {
      throw notFound("Video not found");
    }

    return video;
  }

  async createVideo(body: unknown) {
    const input = this.parseCreateVideo(body);
    return this.repository.createVideo(input);
  }

  async importAudioAndSrt(input: { externalId: string; title: string; sourceLanguage?: string; sourceUrl?: string; audioPath: string; srtPath: string; }) {
    const video = await this.repository.createVideo({
      externalId: input.externalId,
      title: input.title,
      sourceLanguage: input.sourceLanguage,
      sourceUrl: input.sourceUrl,
    });
    const job = await this.jobRepository.createJob(createId("job"), video.id);

    try {
      await this.jobRepository.updateJobStatus(job.id, "PROCESSING", "ALIGNING");
      const alignmentResult = await this.stableTsClient.alignAudioWithSrt(video.id, input.audioPath, input.srtPath);
      const alignmentId = await this.alignmentRepository.createAlignment(video.id, "stable-ts", null);
      await this.alignmentRepository.createSegmentsAndWords(
        alignmentId,
        alignmentResult.segments.map((segment, segmentIndex) => ({
          externalSegmentId: segment.id != null ? String(segment.id) : null,
          index: segmentIndex,
          text: segment.text,
          start: segment.start,
          end: segment.end,
          words: segment.words.map((word, wordIndex) => ({ index: wordIndex, text: word.word, pinyin: word.pinyin ?? null, start: word.start, end: word.end })),
        }))
      );
      await this.jobRepository.updateJobStatus(job.id, "COMPLETED", "DONE");
      return { jobId: job.id, videoId: video.id, status: "COMPLETED" };
    } catch (error) {
      await this.jobRepository.updateJobStatus(job.id, "FAILED", "FAILED", (error as Error).message);
      throw error;
    } finally {
      await Promise.allSettled([unlink(input.audioPath), unlink(input.srtPath)]);
    }
  }

  private parseCreateVideo(body: unknown): CreateVideoInput {
    if (!body || typeof body !== "object") {
      throw badRequest("Request body must be an object");
    }

    const value = body as Record<string, unknown>;
    const externalId = typeof value.externalId === "string" ? value.externalId.trim() : "";
    const title = typeof value.title === "string" ? value.title.trim() : "";
    const sourceUrl = typeof value.sourceUrl === "string" && value.sourceUrl.trim() ? value.sourceUrl.trim() : undefined;
    const sourceLanguage = typeof value.sourceLanguage === "string" && value.sourceLanguage.trim() ? value.sourceLanguage.trim() : undefined;

    if (!externalId) {
      throw badRequest("externalId is required");
    }

    if (!title) {
      throw badRequest("title is required");
    }

    return { externalId, title, sourceUrl, sourceLanguage };
  }
}

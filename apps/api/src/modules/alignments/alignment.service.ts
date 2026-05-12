import { notFound } from "../../shared/http/errors.js";
import type { PaginationParams } from "../../shared/validation/pagination.js";
import { AlignmentRepository } from "./alignment.repository.js";

export class AlignmentService {
  constructor(private readonly repository = new AlignmentRepository()) {}

  async getLatestAlignment(videoId: string) {
    const alignment = await this.repository.getLatestAlignmentForVideo(videoId);
    if (!alignment) {
      throw notFound("Alignment not found for video");
    }

    return alignment;
  }

  async listSegments(videoId: string, pagination: PaginationParams) {
    const [items, total] = await Promise.all([
      this.repository.listSegmentsForVideo(videoId, pagination),
      this.repository.countSegmentsForVideo(videoId),
    ]);

    return {
      items,
      pagination: {
        ...pagination,
        total,
      },
    };
  }
}

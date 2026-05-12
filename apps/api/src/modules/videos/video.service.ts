import { badRequest, notFound } from "../../shared/http/errors.js";
import type { PaginationParams } from "../../shared/validation/pagination.js";
import { VideoRepository } from "./video.repository.js";
import type { CreateVideoInput } from "./video.types.js";

export class VideoService {
  constructor(private readonly repository = new VideoRepository()) {}

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

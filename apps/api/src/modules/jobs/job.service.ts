import { notFound } from "../../shared/http/errors.js";
import type { PaginationParams } from "../../shared/validation/pagination.js";
import { JobRepository } from "./job.repository.js";

export class JobService {
  constructor(private readonly repository = new JobRepository()) {}

  async listJobs(pagination: PaginationParams) {
    const [items, total] = await Promise.all([
      this.repository.listJobs(pagination),
      this.repository.countJobs(),
    ]);

    return {
      items,
      pagination: {
        ...pagination,
        total,
      },
    };
  }

  async getJob(id: string) {
    const job = await this.repository.getJobById(id);
    if (!job) {
      throw notFound("Processing job not found");
    }

    return job;
  }
}

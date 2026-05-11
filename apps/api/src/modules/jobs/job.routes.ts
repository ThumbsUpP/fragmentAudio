import { Router, type IRouter } from "express";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { parsePagination } from "../../shared/validation/pagination.js";
import { JobService } from "./job.service.js";

const jobService = new JobService();

export const jobRouter: IRouter = Router();

jobRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await jobService.listJobs(pagination);
    return res.status(200).json(result);
  })
);

jobRouter.get(
  "/:jobId",
  asyncHandler(async (req, res) => {
    const job = await jobService.getJob(req.params.jobId);
    return res.status(200).json(job);
  })
);

import { Router, type IRouter } from "express";
import { AlignmentService } from "../alignments/alignment.service.js";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { parsePagination } from "../../shared/validation/pagination.js";
import { TranslationService } from "../translations/translation.service.js";
import { VideoService } from "./video.service.js";

const videoService = new VideoService();
const alignmentService = new AlignmentService();
const translationService = new TranslationService();

export const videoRouter: IRouter = Router();

videoRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await videoService.listVideos(pagination);
    return res.status(200).json(result);
  })
);

videoRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const video = await videoService.createVideo(req.body);
    return res.status(201).json(video);
  })
);

videoRouter.get(
  "/:videoId",
  asyncHandler(async (req, res) => {
    const video = await videoService.getVideo(req.params.videoId);
    return res.status(200).json(video);
  })
);

videoRouter.get(
  "/:videoId/alignment",
  asyncHandler(async (req, res) => {
    const alignment = await alignmentService.getLatestAlignment(req.params.videoId);
    return res.status(200).json(alignment);
  })
);

videoRouter.get(
  "/:videoId/segments",
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await alignmentService.listSegments(req.params.videoId, pagination);
    return res.status(200).json(result);
  })
);

videoRouter.get(
  "/:videoId/translations",
  asyncHandler(async (req, res) => {
    const language = typeof req.query.language === "string" ? req.query.language : undefined;
    const translations = await translationService.listForVideo(req.params.videoId, language);
    return res.status(200).json({ data: translations });
  })
);

videoRouter.post(
  "/:videoId/translations",
  asyncHandler(async (req, res) => {
    const translation = await translationService.createForVideo(req.params.videoId, req.body);
    return res.status(201).json(translation);
  })
);

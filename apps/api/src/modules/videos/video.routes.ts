import { Router, type IRouter } from "express";
import multer from "multer";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { badRequest } from "../../shared/http/errors.js";
import { AlignmentService } from "../alignments/alignment.service.js";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { parsePagination } from "../../shared/validation/pagination.js";
import { TranslationService } from "../translations/translation.service.js";
import { VideoService } from "./video.service.js";

const videoService = new VideoService();
const alignmentService = new AlignmentService();
const translationService = new TranslationService();

export const videoRouter: IRouter = Router();
const uploadDir = join(process.cwd(), ".uploads");
mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

videoRouter.post(
  "/import",
  upload.fields([{ name: "audio", maxCount: 1 }, { name: "srt", maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const audio = files?.audio?.[0];
    const srt = files?.srt?.[0];
    if (!audio || !srt) {
      throw badRequest("audio and srt files are required");
    }
    const externalId = typeof req.body.externalId === "string" ? req.body.externalId.trim() : "";
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!externalId || !title) {
      throw badRequest("externalId and title are required");
    }

    const result = await videoService.importAudioAndSrt({
      externalId,
      title,
      sourceLanguage: typeof req.body.sourceLanguage === "string" ? req.body.sourceLanguage : undefined,
      sourceUrl: typeof req.body.sourceUrl === "string" ? req.body.sourceUrl : undefined,
      audioPath: audio.path,
      srtPath: srt.path,
    });

    return res.status(201).json(result);
  })
);

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
  "/:videoId/translations/regenerate",
  asyncHandler(async (req, res) => {
    const translation = await translationService.regenerateForVideo(req.params.videoId, req.body);
    return res.status(201).json(translation);
  })
);

videoRouter.post(
  "/:videoId/translations",
  asyncHandler(async (req, res) => {
    const translation = await translationService.createForVideo(req.params.videoId, req.body);
    return res.status(201).json(translation);
  })
);

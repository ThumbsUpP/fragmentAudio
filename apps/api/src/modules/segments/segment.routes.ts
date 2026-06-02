import { Router, type IRouter } from "express";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { GrammarService } from "../grammar/grammar.service.js";
import { TranslationService } from "../translations/translation.service.js";
import { WordService } from "../words/word.service.js";

const grammarService = new GrammarService();
const translationService = new TranslationService();
const wordService = new WordService();

export const segmentRouter: IRouter = Router();

segmentRouter.get(
  "/:segmentId/words",
  asyncHandler(async (req, res) => {
    const words = await wordService.listWordsForSegment(req.params.segmentId);
    return res.status(200).json({ data: words });
  })
);

segmentRouter.get(
  "/:segmentId/translations",
  asyncHandler(async (req, res) => {
    const language = typeof req.query.language === "string" ? req.query.language : undefined;
    const translations = await translationService.listForSegment(req.params.segmentId, language);
    return res.status(200).json({ data: translations });
  })
);

segmentRouter.post(
  "/:segmentId/translations/regenerate",
  asyncHandler(async (req, res) => {
    const translation = await translationService.regenerateForSegment(req.params.segmentId, req.body);
    return res.status(201).json(translation);
  })
);

segmentRouter.post(
  "/:segmentId/translations",
  asyncHandler(async (req, res) => {
    const translation = await translationService.createForSegment(req.params.segmentId, req.body);
    return res.status(201).json(translation);
  })
);

segmentRouter.get(
  "/:segmentId/grammar",
  asyncHandler(async (req, res) => {
    const language = typeof req.query.language === "string" ? req.query.language : undefined;
    const explanation = await grammarService.getForSegment(req.params.segmentId, language);
    return res.status(200).json(explanation);
  })
);

segmentRouter.post(
  "/:segmentId/grammar/regenerate",
  asyncHandler(async (req, res) => {
    const explanation = await grammarService.regenerateForSegment(req.params.segmentId, req.body);
    return res.status(201).json(explanation);
  })
);

segmentRouter.post(
  "/:segmentId/grammar",
  asyncHandler(async (req, res) => {
    const explanation = await grammarService.createForSegment(req.params.segmentId, req.body);
    return res.status(201).json(explanation);
  })
);

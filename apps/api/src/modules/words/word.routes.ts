import { Router, type IRouter } from "express";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { TranslationService } from "../translations/translation.service.js";
import { WordService } from "./word.service.js";

const translationService = new TranslationService();
const wordService = new WordService();

export const wordRouter: IRouter = Router();

wordRouter.get(
  "/:wordId",
  asyncHandler(async (req, res) => {
    const word = await wordService.getWord(req.params.wordId);
    return res.status(200).json(word);
  })
);

wordRouter.get(
  "/:wordId/translations",
  asyncHandler(async (req, res) => {
    const language = typeof req.query.language === "string" ? req.query.language : undefined;
    const translations = await translationService.listForWord(req.params.wordId, language);
    return res.status(200).json({ data: translations });
  })
);

wordRouter.post(
  "/:wordId/translations",
  asyncHandler(async (req, res) => {
    const translation = await translationService.createForWord(req.params.wordId, req.body);
    return res.status(201).json(translation);
  })
);

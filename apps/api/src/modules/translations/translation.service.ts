import { requireString, optionalString } from "../../shared/validation/body.js";
import { badRequest, notFound } from "../../shared/http/errors.js";
import { AlignmentRepository } from "../alignments/alignment.repository.js";
import { LlmService } from "../llm/llm.service.js";
import { WordService } from "../words/word.service.js";
import { TranslationRepository } from "./translation.repository.js";
import type { CreateTranslationInput } from "./translation.types.js";

const translationRepository = new TranslationRepository();
const alignmentRepository = new AlignmentRepository();
const llmService = new LlmService();
const wordService = new WordService();

const parseCreateTranslation = (body: unknown): CreateTranslationInput => ({
  language: requireString(body, "language"),
  text: requireString(body, "text"),
  provider: optionalString(body, "provider"),
  model: optionalString(body, "model"),
});

export class TranslationService {
  async listForVideo(videoId: string, language?: string) {
    return translationRepository.listForVideo(videoId, language);
  }

  async listForSegment(segmentId: string, language?: string) {
    return translationRepository.listForSegment(segmentId, language);
  }

  async listForWord(wordId: string, language?: string) {
    return translationRepository.listForWord(wordId, language);
  }

  async createForVideo(videoId: string, body: unknown) {
    return translationRepository.createForVideo(videoId, parseCreateTranslation(body));
  }

  async createForSegment(segmentId: string, body: unknown) {
    return translationRepository.createForSegment(segmentId, parseCreateTranslation(body));
  }

  async createForWord(wordId: string, body: unknown) {
    return translationRepository.createForWord(wordId, parseCreateTranslation(body));
  }

  async regenerateForVideo(videoId: string, body: unknown) {
    const language = requireString(body, "language");
    const alignment = await alignmentRepository.getLatestAlignmentForVideo(videoId);
    if (!alignment) {
      throw notFound("Alignment not found for video");
    }

    const sourceText = alignment.segments.map((segment) => segment.text).join("\n").trim();
    if (!sourceText) {
      throw badRequest("Video has no segment text to translate");
    }

    const generated = await llmService.translate(sourceText, language);
    return translationRepository.createForVideo(videoId, {
      language,
      text: generated.text,
      provider: generated.provider,
      model: generated.model,
    });
  }

  async regenerateForSegment(segmentId: string, body: unknown) {
    const language = requireString(body, "language");
    const segment = await alignmentRepository.getSegmentById(segmentId);
    if (!segment) {
      throw notFound("Segment not found");
    }

    const generated = await llmService.translate(segment.text, language);
    return translationRepository.createForSegment(segmentId, {
      language,
      text: generated.text,
      provider: generated.provider,
      model: generated.model,
    });
  }

  async regenerateForWord(wordId: string, body: unknown) {
    const language = requireString(body, "language");
    const word = await wordService.getWord(wordId);
    const generated = await llmService.translate(word.text, language);

    return translationRepository.createForWord(wordId, {
      language,
      text: generated.text,
      provider: generated.provider,
      model: generated.model,
    });
  }
}

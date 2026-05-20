import { requireString, optionalString } from "../../shared/validation/body.js";
import { TranslationRepository } from "./translation.repository.js";
import type { CreateTranslationInput } from "./translation.types.js";

const translationRepository = new TranslationRepository();

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
}

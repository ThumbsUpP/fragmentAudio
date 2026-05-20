import { notFound } from "../../shared/http/errors.js";
import { optionalString, requireString } from "../../shared/validation/body.js";
import { GrammarRepository } from "./grammar.repository.js";
import type { CreateGrammarExplanationInput } from "./grammar.types.js";

const grammarRepository = new GrammarRepository();

const parseCreateGrammarExplanation = (body: unknown): CreateGrammarExplanationInput => ({
  language: optionalString(body, "language") ?? "en",
  answerMarkdown: requireString(body, "answerMarkdown"),
  provider: optionalString(body, "provider"),
  model: optionalString(body, "model"),
});

export class GrammarService {
  async getForSegment(segmentId: string, language = "en") {
    const explanation = await grammarRepository.getForSegment(segmentId, language);
    if (!explanation) {
      throw notFound("Grammar explanation not found");
    }

    return explanation;
  }

  async createForSegment(segmentId: string, body: unknown) {
    return grammarRepository.createForSegment(segmentId, parseCreateGrammarExplanation(body));
  }
}

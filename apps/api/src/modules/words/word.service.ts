import { notFound } from "../../shared/http/errors.js";
import { WordRepository } from "./word.repository.js";

const wordRepository = new WordRepository();

export class WordService {
  async listWordsForSegment(segmentId: string) {
    return wordRepository.listWordsForSegment(segmentId);
  }

  async getWord(wordId: string) {
    const word = await wordRepository.getWordById(wordId);
    if (!word) {
      throw notFound("Word not found");
    }

    return word;
  }
}

import { LlmClient } from "../clients/LlmClient.js";
import {
  ProcessingType,
  TranslationResult,
  GrammarResult,
} from "../models/LlmProcessingModel.js";

export class LlmService {
  private llmClient: LlmClient;

  constructor() {
    this.llmClient = new LlmClient();
  }

  /**
   * Translates text to the target language using the LLM
   * @param videoId The ID of the video
   * @param text The text to translate
   * @param targetLanguage The language to translate to
   * @returns The translation result
   */
  async translateText(videoId: string, text: string, targetLanguage: string): Promise<TranslationResult> {
    try {
      console.log(`Translating text to ${targetLanguage}...`);

      // Call the LLM service to translate the text
      const translatedText = await this.llmClient.translate(text, targetLanguage);

      if (!translatedText) {
        throw new Error("Failed to get translation from LLM service");
      }

      // Create a translation result
      const translationResult: TranslationResult = {
        videoId,
        processingType: ProcessingType.TRANSLATION,
        originalText: text,
        language: targetLanguage,
        translatedText,
        createdAt: new Date().toISOString()
      };

      return translationResult;
    } catch (error) {
      console.error("Error in translateText:", error);
      throw error;
    }
  }

  /**
   * Explains grammar in the provided text using the LLM
   * @param segmentID The ID of the segment
   * @param videoId The ID of the video
   * @param text The text to explain
   * @returns The grammar explanation result
   */
  async explainGrammar(segmentID: string, videoId: string, text: string, targetLanguage: string): Promise<GrammarResult> {
    try {
      console.log("Explaining grammar...");

      // Call the LLM service to explain grammar
      const result = await this.llmClient.explainGrammar(text, targetLanguage);

      if (!result.answer) {
        throw new Error("Failed to get grammar explanation from LLM service");
      }

      // Create a grammar explanation result
      const grammarResult: GrammarResult = {
        processingType: ProcessingType.GRAMMAR,
        videoId,
        id: segmentID,
        originalText: text,
        answer: result.answer,
        createdAt: new Date().toISOString()
      };

      return grammarResult;
    } catch (error) {
      console.error("Error in explainGrammar:", error);
      throw error;
    }
  }
}

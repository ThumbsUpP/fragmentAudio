import { LlmClient } from "../clients/LlmClient.js";
import {
  ProcessingType,
  TranslationResult,
  GrammarResult,
  SummarizationResult,
  LanguageDetectionResult,
  SentimentAnalysisResult
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
  async explainGrammar(segmentID: string, videoId: string, text: string): Promise<GrammarResult> {
    try {
      console.log("Explaining grammar...");

      // Call the LLM service to explain grammar
      const result = await this.llmClient.explainGrammar(text);

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

  /**
   * Summarizes the provided text using the LLM
   * @param videoId The ID of the video
   * @param text The text to summarize
   * @param maxLength Optional maximum length for the summary
   * @returns The summarization result
   */
  async summarizeText(videoId: string, text: string, maxLength?: number): Promise<SummarizationResult> {
    try {
      console.log("Summarizing text...");

      // Call the LLM service to summarize the text
      const summary = await this.llmClient.summarize(text, maxLength);

      if (!summary) {
        throw new Error("Failed to get summary from LLM service");
      }

      // Create a summarization result
      const summarizationResult: SummarizationResult = {
        videoId,
        processingType: ProcessingType.SUMMARIZATION,
        originalText: text,
        summary,
        maxLength,
        createdAt: new Date().toISOString()
      };

      return summarizationResult;
    } catch (error) {
      console.error("Error in summarizeText:", error);
      throw error;
    }
  }

  /**
   * Detects the language of the provided text using the LLM
   * @param videoId The ID of the video
   * @param text The text to analyze
   * @returns The language detection result
   */
  async detectLanguage(videoId: string, text: string): Promise<LanguageDetectionResult> {
    try {
      console.log("Detecting language...");

      // Call the LLM service to detect the language
      const result = await this.llmClient.detectLanguage(text);

      if (!result.detectedLanguage) {
        throw new Error("Failed to detect language from LLM service");
      }

      // Create a language detection result
      const languageDetectionResult: LanguageDetectionResult = {
        videoId,
        processingType: ProcessingType.LANGUAGE_DETECTION,
        originalText: text,
        detectedLanguage: result.detectedLanguage,
        confidence: result.confidence,
        createdAt: new Date().toISOString()
      };

      return languageDetectionResult;
    } catch (error) {
      console.error("Error in detectLanguage:", error);
      throw error;
    }
  }

  /**
   * Analyzes the sentiment of the provided text using the LLM
   * @param videoId The ID of the video
   * @param text The text to analyze
   * @returns The sentiment analysis result
   */
  async analyzeSentiment(videoId: string, text: string): Promise<SentimentAnalysisResult> {
    try {
      console.log("Analyzing sentiment...");

      // Call the LLM service to analyze sentiment
      const result = await this.llmClient.analyzeSentiment(text);

      if (!result.sentiment) {
        throw new Error("Failed to analyze sentiment from LLM service");
      }

      // Create a sentiment analysis result
      const sentimentAnalysisResult: SentimentAnalysisResult = {
        videoId,
        processingType: ProcessingType.SENTIMENT_ANALYSIS,
        originalText: text,
        sentiment: result.sentiment,
        score: result.score,
        details: result.details,
        createdAt: new Date().toISOString()
      };

      return sentimentAnalysisResult;
    } catch (error) {
      console.error("Error in analyzeSentiment:", error);
      throw error;
    }
  }
}

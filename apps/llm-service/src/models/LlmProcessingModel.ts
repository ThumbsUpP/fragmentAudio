/**
 * Types of language processing supported by the LLM service
 */
export enum ProcessingType {
  TRANSLATION = "translation",
  GRAMMAR = "grammar",
}

/**
 * Base interface for all LLM processing results
 */
export interface LlmProcessingBase {
  /**
   * The ID of the video this processing result belongs to
   */
  videoId: string;

  /**
   * Type of language processing
   */
  processingType: ProcessingType;

  /**
   * Original text that was processed
   */
  originalText: string;

  /**
   * Timestamp when the processing was performed
   */
  createdAt: string;

  /**
   * Optional ID for the processing record
   */
  id?: number | string;
}

/**
 * Interface for translation results
 */
export interface TranslationResult extends LlmProcessingBase {
  processingType: ProcessingType.TRANSLATION;

  /**
   * The language of the translation (e.g., "es", "fr", "de")
   */
  language: string;

  /**
   * The translated text content
   */
  translatedText: string;
}

/**
 * Interface for grammar correction results
 */
export interface GrammarResult extends LlmProcessingBase {
  processingType: ProcessingType.GRAMMAR;
  id: string;
  originalText: string;

  /**
   * The grammar explaination content
   */
  answer: string;
}


/**
 * Union type for all possible LLM processing results
 */
export type LlmProcessingResult =
  | TranslationResult
  | GrammarResult;

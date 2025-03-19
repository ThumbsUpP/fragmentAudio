/**
 * Types of language processing supported by the LLM service
 */
export enum ProcessingType {
  TRANSLATION = "translation",
  GRAMMAR = "grammar",
  SUMMARIZATION = "summarization",
  LANGUAGE_DETECTION = "language_detection",
  SENTIMENT_ANALYSIS = "sentiment_analysis"
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
 * Interface for text summarization results
 */
export interface SummarizationResult extends LlmProcessingBase {
  processingType: ProcessingType.SUMMARIZATION;

  /**
   * The summarized text content
   */
  summary: string;

  /**
   * The requested maximum length for the summary (if specified)
   */
  maxLength?: number;
}

/**
 * Interface for language detection results
 */
export interface LanguageDetectionResult extends LlmProcessingBase {
  processingType: ProcessingType.LANGUAGE_DETECTION;

  /**
   * The detected language code (e.g., "en", "es", "fr")
   */
  detectedLanguage: string;

  /**
   * Confidence score for the detection (0-1)
   */
  confidence?: number;
}

/**
 * Interface for sentiment analysis results
 */
export interface SentimentAnalysisResult extends LlmProcessingBase {
  processingType: ProcessingType.SENTIMENT_ANALYSIS;

  /**
   * The overall sentiment (positive, negative, neutral)
   */
  sentiment: string;

  /**
   * Numerical score representing sentiment (-1 to 1)
   */
  score?: number;

  /**
   * Additional details about the sentiment analysis
   */
  details?: string;
}

/**
 * Union type for all possible LLM processing results
 */
export type LlmProcessingResult =
  | TranslationResult
  | GrammarResult
  | SummarizationResult
  | LanguageDetectionResult
  | SentimentAnalysisResult;

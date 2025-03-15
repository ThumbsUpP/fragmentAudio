/**
 * Represents the result of a translation operation
 */
export interface TranslationResult {
  /**
   * The ID of the video this translation belongs to
   */
  videoId: string;
  
  /**
   * The language of the translation (e.g., "es", "fr", "de")
   */
  language: string;
  
  /**
   * The translated text content
   */
  translatedText: string;
  
  /**
   * Timestamp when the translation was created
   */
  createdAt: string;
  
  /**
   * Optional ID for the translation record
   */
  id?: number | string;
}

import { LlmClient } from "../clients/LlmClient.js";
import { VideoDbClient } from "../clients/VideoDbClient.js";
import { TranslationModel } from "../models/TranslationModel.js";

export class TranslationService {
  private llmClient: LlmClient;
  private videoDbClient: VideoDbClient;

  constructor() {
    this.llmClient = new LlmClient();
    this.videoDbClient = new VideoDbClient();
  }

  /**
   * Translates a transcript to the target language using the LLM
   * @param transcript The transcript text to translate
   * @param targetLanguage The language to translate to
   * @returns The translated text
   */
  async translateTranscript(transcript: string, targetLanguage: string): Promise<string> {
    try {
      console.log(`Translating transcript to ${targetLanguage}...`);
      
      // Call the LLM service to translate the transcript
      const translatedText = await this.llmClient.translate(transcript, targetLanguage);
      
      if (!translatedText) {
        throw new Error("Failed to get translation from LLM service");
      }
      
      return translatedText;
    } catch (error) {
      console.error("Error in translateTranscript:", error);
      throw error;
    }
  }

  /**
   * Saves a translation to the video-db service
   * @param videoId The ID of the video
   * @param language The language of the translation
   * @param translatedText The translated text
   * @returns The saved translation data or null if failed
   */
  async saveTranslation(
    videoId: string,
    language: string,
    translatedText: string
  ): Promise<TranslationModel | null> {
    try {
      // Create a translation model
      const translation: TranslationModel = {
        videoId,
        language,
        translatedText,
        createdAt: new Date().toISOString()
      };
      
      // Save the translation to the video-db service
      const savedTranslation = await this.videoDbClient.saveTranslation(translation);
      
      return savedTranslation;
    } catch (error) {
      console.error("Error in saveTranslation:", error);
      return null;
    }
  }

  /**
   * Gets translations for a video
   * @param videoId The ID of the video
   * @param language Optional language filter
   * @returns Array of translations
   */
  async getTranslationsForVideo(
    videoId: string,
    language?: string
  ): Promise<TranslationModel[]> {
    try {
      // Get translations from the video-db service
      const translations = await this.videoDbClient.getTranslations(videoId, language);
      
      return translations;
    } catch (error) {
      console.error("Error in getTranslationsForVideo:", error);
      return [];
    }
  }

  /**
   * Deletes a translation
   * @param videoId The ID of the video
   * @param language The language of the translation to delete
   * @returns Whether the deletion was successful
   */
  async deleteTranslation(videoId: string, language: string): Promise<boolean> {
    try {
      // Delete the translation from the video-db service
      const deleted = await this.videoDbClient.deleteTranslation(videoId, language);
      
      return deleted;
    } catch (error) {
      console.error("Error in deleteTranslation:", error);
      return false;
    }
  }
}

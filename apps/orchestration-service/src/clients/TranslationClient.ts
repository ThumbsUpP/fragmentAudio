import axios from "axios";
import { TranslationResult } from "../models/TranslationResult.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Client for interacting with the transcript-translator service
 */
export class TranslationClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.TRANSLATOR_URL || "http://localhost:3001/api/translations";
  }

  /**
   * Translates a transcript to the target language
   * @param transcript The transcript text to translate
   * @param targetLanguage The language to translate to
   * @returns The translated text
   */
  async translateTranscript(transcript: string, targetLanguage: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/translate`,
        {
          transcript,
          targetLanguage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(`Translation service returned status code ${response.status}`);
      }

      return response.data.translatedText;
    } catch (error) {
      console.error("Error in TranslationClient.translateTranscript:", error);
      throw new Error(`Failed to translate transcript: ${(error as Error).message}`);
    }
  }

  /**
   * Saves a translation to the video-db service
   * @param videoId The ID of the video
   * @param language The language of the translation
   * @param translatedText The translated text
   * @returns The saved translation data
   */
  async saveTranslation(
    videoId: string,
    language: string,
    translatedText: string
  ): Promise<TranslationResult> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/save`,
        {
          videoId,
          language,
          translatedText,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Translation service returned status code ${response.status}`);
      }

      return response.data as TranslationResult;
    } catch (error) {
      console.error("Error in TranslationClient.saveTranslation:", error);
      throw new Error(`Failed to save translation: ${(error as Error).message}`);
    }
  }
}

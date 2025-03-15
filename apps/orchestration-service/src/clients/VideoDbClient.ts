import axios from "axios";
import { TranslationResult } from "../models/TranslationResult.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Client for interacting with the video-db service
 */
export class VideoDbClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.VIDEO_DB_URL || "http://localhost:3000/api/videos";
  }

  /**
   * Saves video data to the video-db service
   * @param videoId The ID of the video
   * @param videoUrl The URL of the video
   * @param jsonData The JSON data to save
   * @returns The saved video data
   */
  async saveVideoData(videoId: string, videoUrl: string, jsonData: any): Promise<any> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          videoId,
          videoUrl,
          jsonData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Video-db service returned status code ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error in VideoDbClient.saveVideoData:", error);
      throw new Error(`Failed to save video data: ${(error as Error).message}`);
    }
  }

  /**
   * Gets video data from the video-db service
   * @param videoId The ID of the video
   * @returns The video data
   */
  async getVideoData(videoId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/${videoId}`);

      if (response.status !== 200) {
        throw new Error(`Video-db service returned status code ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error in VideoDbClient.getVideoData:", error);
      throw new Error(`Failed to get video data: ${(error as Error).message}`);
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
        `${this.apiUrl}/${videoId}/translations`,
        {
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
        throw new Error(`Video-db service returned status code ${response.status}`);
      }

      return response.data as TranslationResult;
    } catch (error) {
      console.error("Error in VideoDbClient.saveTranslation:", error);
      throw new Error(`Failed to save translation: ${(error as Error).message}`);
    }
  }

  /**
   * Gets translations for a video
   * @param videoId The ID of the video
   * @param language Optional language filter
   * @returns Array of translations
   */
  async getTranslations(videoId: string, language?: string): Promise<TranslationResult[]> {
    try {
      let url = `${this.apiUrl}/${videoId}/translations`;
      
      // Add language filter if provided
      if (language) {
        url += `?language=${encodeURIComponent(language)}`;
      }
      
      const response = await axios.get(url);
      
      if (response.status !== 200) {
        throw new Error(`Video-db service returned status code ${response.status}`);
      }
      
      return response.data as TranslationResult[];
    } catch (error) {
      console.error("Error in VideoDbClient.getTranslations:", error);
      throw new Error(`Failed to get translations: ${(error as Error).message}`);
    }
  }
}

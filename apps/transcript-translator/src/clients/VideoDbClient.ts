import axios from "axios";
import { TranslationModel } from "../models/TranslationModel.js";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

export class VideoDbClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.VIDEO_DB_URL || "http://localhost:3000/api/videos";
  }

  /**
   * Saves a translation to the video-db service
   * @param translation The translation data to save
   * @returns The saved translation or null if failed
   */
  async saveTranslation(translation: TranslationModel): Promise<TranslationModel | null> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${translation.videoId}/translations`,
        translation,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        return response.data;
      } else {
        console.error(`Failed to save translation. Status code: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error("Error saving translation to video-db:", error);
      return null;
    }
  }

  /**
   * Gets translations for a video
   * @param videoId The ID of the video
   * @param language Optional language filter
   * @returns Array of translations
   */
  async getTranslations(videoId: string, language?: string): Promise<TranslationModel[]> {
    try {
      let url = `${this.apiUrl}/${videoId}/translations`;
      
      // Add language filter if provided
      if (language) {
        url += `?language=${encodeURIComponent(language)}`;
      }
      
      const response = await axios.get(url);
      
      if (response.status === 200) {
        return response.data;
      } else {
        console.error(`Failed to get translations. Status code: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.error("Error getting translations from video-db:", error);
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
      const url = `${this.apiUrl}/${videoId}/translations?language=${encodeURIComponent(language)}`;
      
      const response = await axios.delete(url);
      
      return response.status === 200;
    } catch (error) {
      console.error("Error deleting translation from video-db:", error);
      return false;
    }
  }
}

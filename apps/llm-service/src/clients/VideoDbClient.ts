import axios from "axios";
import dotenv from "dotenv";
import { GrammarResult } from "../models/LlmProcessingModel.js";

// Load environment variables
dotenv.config();

/**
 * Client for interacting with the video-db service
 */
export class VideoDbClient {
  private videoDbUrl: string;

  constructor() {
    this.videoDbUrl = process.env.VIDEO_DB_URL || "http://localhost:3001/api";
  }

  /**
   * Gets a grammar explanation from the video-db service
   * @param videoId The ID of the video
   * @param segmentId The ID of the segment
   * @returns The grammar explanation or null if not found
   */
  async getGrammarExplanation(videoId: string, segmentId: string): Promise<GrammarResult | null> {
    try {
      const response = await axios.get(`${this.videoDbUrl}/grammar/${videoId}/${segmentId}`);

      if (response.status !== 200) {
        throw new Error(`Video-db grammar service returned status code ${response.status}`);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error("Error in VideoDbClient.getGrammarExplanation:", error);
      throw error;
    }
  }

  /**
   * Saves a grammar explanation to the video-db service
   * @param grammarResult The grammar explanation to save
   * @returns The saved grammar explanation
   */
  async saveGrammarExplanation(grammarResult: GrammarResult): Promise<GrammarResult> {
    try {
      const response = await axios.post(
        `${this.videoDbUrl}/grammar`,
        grammarResult,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Video-db grammar service returned status code ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error in VideoDbClient.saveGrammarExplanation:", error);
      throw error;
    }
  }
}

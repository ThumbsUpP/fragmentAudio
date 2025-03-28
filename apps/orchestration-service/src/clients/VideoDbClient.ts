import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Client for interacting with the video-db service
 */
export class VideoDbClient {
  private alignmentApiUrl: string;
  private grammarApiUrl: string;
  private baseApiUrl: string;

  constructor() {
    this.baseApiUrl = process.env.VIDEO_DB_URL || "http://localhost:3001/api";
    this.alignmentApiUrl = `${this.baseApiUrl}/alignments`;
    this.grammarApiUrl = `${this.baseApiUrl}/grammar`;
  }



  /**
   * Saves alignment result directly to the video-db service
   * @param videoId The ID of the video
   * @param videoUrl The URL of the video
   * @param alignmentData The alignment result data
   * @returns The saved alignment result
   */
  async saveAlignmentResult(videoId: string, videoUrl: string, alignmentData: any): Promise<any> {
    try {
      const response = await axios.post(
        this.alignmentApiUrl,
        {
          videoId,
          videoUrl,
          alignmentData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Video-db alignment service returned status code ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error in VideoDbClient.saveAlignmentResult:", error);
      throw new Error(`Failed to save alignment result: ${(error as Error).message}`);
    }
  }

  /**
   * Gets alignment result from the video-db service
   * @param videoId The ID of the video
   * @returns The alignment result
   */
  async getAlignmentResult(videoId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.alignmentApiUrl}/${videoId}`);

      if (response.status !== 200) {
        throw new Error(`Video-db alignment service returned status code ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error in VideoDbClient.getAlignmentResult:", error);
      throw new Error(`Failed to get alignment result: ${(error as Error).message}`);
    }
  }

  /**
   * Gets a grammar explanation from the video-db service
   * @param videoId The ID of the video
   * @param segmentId The ID of the segment
   * @returns The grammar explanation or null if not found
   */
  async getGrammarExplanation(videoId: string, segmentId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.grammarApiUrl}/${videoId}/${segmentId}`);

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
  async saveGrammarExplanation(grammarResult: any): Promise<any> {
    try {
      // Ensure we're using the correct endpoint URL
      console.log(`Saving grammar explanation to: ${this.grammarApiUrl}`);
      const response = await axios.post(
        this.grammarApiUrl,
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

import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Client for interacting with the video-db service
 */
export class VideoDbClient {
  private alignmentApiUrl: string;

  constructor() {
    this.alignmentApiUrl = process.env.VIDEO_DB_ALIGNMENT_URL || "http://localhost:3001/api/alignments";
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
}

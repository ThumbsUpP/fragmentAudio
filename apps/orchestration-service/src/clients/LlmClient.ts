import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Client for interacting with the LLM service
 */
export class LlmClient {
  private llmApiUrl: string;

  constructor() {
    this.llmApiUrl = process.env.LLM_SERVICE_URL || "http://localhost:3002/api/llm";
  }

  /**
   * Requests a grammar explanation from the LLM service
   * @param videoId The ID of the video
   * @param segmentId The ID of the segment
   * @param text The text to explain
   * @param targetLanguage The target language for the explanation
   * @returns The grammar explanation result
   */
  async explainGrammar(videoId: string, segmentId: string, text: string, targetLanguage: string = "english"): Promise<any> {
    try {
      const response = await axios.post(
        `${this.llmApiUrl}/grammar`,
        {
          videoId,
          segmentId,
          text,
          targetLanguage
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(`LLM service returned status code ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error in LlmClient.explainGrammar:", error);
      throw error;
    }
  }
}

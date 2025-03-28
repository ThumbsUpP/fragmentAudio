import { AppDataSource } from "../data-source.js";
import { GrammarExplanation } from "../entity/GrammarExplanation.js";

/**
 * Service for managing grammar explanations
 */
export class GrammarExplanationService {
  private grammarExplanationRepository = AppDataSource.getRepository(GrammarExplanation);

  /**
   * Gets a grammar explanation by video ID and segment ID
   * @param videoId The ID of the video
   * @param segmentId The ID of the segment
   * @returns The grammar explanation or null if not found
   */
  async getGrammarExplanation(videoId: string, segmentId: string): Promise<GrammarExplanation | null> {
    try {
      return await this.grammarExplanationRepository.findOne({
        where: {
          videoId,
          segmentId
        }
      });
    } catch (error) {
      console.error(`Error getting grammar explanation for videoId ${videoId}, segmentId ${segmentId}:`, error);
      throw error;
    }
  }

  /**
   * Saves a grammar explanation
   * @param grammarExplanation The grammar explanation to save
   * @returns The saved grammar explanation
   */
  async saveGrammarExplanation(grammarExplanation: GrammarExplanation): Promise<GrammarExplanation> {
    try {
      // Check if a grammar explanation already exists for this video and segment
      const existingExplanation = await this.getGrammarExplanation(
        grammarExplanation.videoId,
        grammarExplanation.segmentId
      );

      if (existingExplanation) {
        // Update existing explanation
        existingExplanation.originalText = grammarExplanation.originalText;
        existingExplanation.answer = grammarExplanation.answer;
        existingExplanation.processingType = grammarExplanation.processingType;
        return await this.grammarExplanationRepository.save(existingExplanation);
      }

      // Create new explanation
      return await this.grammarExplanationRepository.save(grammarExplanation);
    } catch (error) {
      console.error("Error saving grammar explanation:", error);
      throw error;
    }
  }
}

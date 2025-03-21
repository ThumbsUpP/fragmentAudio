import { AppDataSource } from "../data-source.js";
import { TranslationData } from "../entity/TranslationData.js";

export class TranslationDataService {
  private translationRepository = AppDataSource.getRepository(TranslationData);

  /**
   * Get all translations for a specific video
   * @param videoId The ID of the video
   * @param language Optional language filter
   * @returns Array of translation data
   */
  async getTranslationsForVideo(videoId: string, language?: string): Promise<TranslationData[]> {
    try {
      const queryBuilder = this.translationRepository
        .createQueryBuilder("translation")
        .where("translation.videoId = :videoId", { videoId });

      if (language) {
        queryBuilder.andWhere("translation.language = :language", { language });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error(`Error fetching translations for video ${videoId}:`, error);
      return [];
    }
  }

  /**
   * Save a translation for a video
   * @param videoId The ID of the video
   * @param language The language of the translation
   * @param translatedText The translated text
   * @returns The saved translation data
   */
  async saveTranslation(
    videoId: string,
    language: string,
    translatedText: string
  ): Promise<TranslationData> {
    try {
      // Check if a translation already exists for this video and language
      let translation = await this.translationRepository.findOne({
        where: { videoId, language }
      });

      if (translation) {
        // Update existing translation
        translation.translatedText = translatedText;
      } else {
        // Create new translation
        translation = this.translationRepository.create({
          videoId,
          language,
          translatedText
        });
      }

      return await this.translationRepository.save(translation);
    } catch (error) {
      console.error(`Error saving translation for video ${videoId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a translation
   * @param videoId The ID of the video
   * @param language The language of the translation to delete
   * @returns Whether the deletion was successful
   */
  async deleteTranslation(videoId: string, language: string): Promise<boolean> {
    try {
      const result = await this.translationRepository.delete({ videoId, language });
      return result.affected !== undefined && result.affected !== null && result.affected > 0;
    } catch (error) {
      console.error(`Error deleting translation for video ${videoId}:`, error);
      return false;
    }
  }
}

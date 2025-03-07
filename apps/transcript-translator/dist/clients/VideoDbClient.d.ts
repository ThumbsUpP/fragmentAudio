import { TranslationModel } from "../models/TranslationModel.js";
export declare class VideoDbClient {
    private apiUrl;
    constructor();
    /**
     * Saves a translation to the video-db service
     * @param translation The translation data to save
     * @returns The saved translation or null if failed
     */
    saveTranslation(translation: TranslationModel): Promise<TranslationModel | null>;
    /**
     * Gets translations for a video
     * @param videoId The ID of the video
     * @param language Optional language filter
     * @returns Array of translations
     */
    getTranslations(videoId: string, language?: string): Promise<TranslationModel[]>;
    /**
     * Deletes a translation
     * @param videoId The ID of the video
     * @param language The language of the translation to delete
     * @returns Whether the deletion was successful
     */
    deleteTranslation(videoId: string, language: string): Promise<boolean>;
}

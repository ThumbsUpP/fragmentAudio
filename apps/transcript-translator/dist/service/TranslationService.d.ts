import { TranslationModel } from "../models/TranslationModel.js";
export declare class TranslationService {
    private llmClient;
    private videoDbClient;
    constructor();
    /**
     * Translates a transcript to the target language using the LLM
     * @param transcript The transcript text to translate
     * @param targetLanguage The language to translate to
     * @returns The translated text
     */
    translateTranscript(transcript: string, targetLanguage: string): Promise<string>;
    /**
     * Saves a translation to the video-db service
     * @param videoId The ID of the video
     * @param language The language of the translation
     * @param translatedText The translated text
     * @returns The saved translation data or null if failed
     */
    saveTranslation(videoId: string, language: string, translatedText: string): Promise<TranslationModel | null>;
    /**
     * Gets translations for a video
     * @param videoId The ID of the video
     * @param language Optional language filter
     * @returns Array of translations
     */
    getTranslationsForVideo(videoId: string, language?: string): Promise<TranslationModel[]>;
    /**
     * Deletes a translation
     * @param videoId The ID of the video
     * @param language The language of the translation to delete
     * @returns Whether the deletion was successful
     */
    deleteTranslation(videoId: string, language: string): Promise<boolean>;
}

export declare class LlmClient {
    private apiKey;
    private apiUrl;
    constructor();
    /**
     * Translates text to the specified target language using an LLM
     * @param text The text to translate
     * @param targetLanguage The language to translate to
     * @returns The translated text
     */
    translate(text: string, targetLanguage: string): Promise<string>;
}

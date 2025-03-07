import axios from "axios";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

export class LlmClient {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY || "";
    this.apiUrl = process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";
    
    if (!this.apiKey) {
      console.warn("Warning: LLM_API_KEY is not set. Translation functionality will not work properly.");
    }
  }

  /**
   * Translates text to the specified target language using an LLM
   * @param text The text to translate
   * @param targetLanguage The language to translate to
   * @returns The translated text
   */
  async translate(text: string, targetLanguage: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error("LLM_API_KEY is not set");
      }

      // Create a prompt for the LLM to translate the text
      const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;

      // Make a request to the LLM API
      const response = await axios.post(
        this.apiUrl,
        {
          model: process.env.LLM_MODEL || "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional translator. Translate the text accurately while preserving meaning and tone."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          }
        }
      );

      // Extract the translated text from the response
      const translatedText = response.data.choices[0].message.content.trim();
      return translatedText;
    } catch (error) {
      console.error("Error calling LLM API:", error);
      throw new Error(`Failed to translate text: ${(error as Error).message}`);
    }
  }
}

import { OpenAI } from "openai";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

export class LlmClient {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private openai: OpenAI;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY || "";
    this.apiUrl = process.env.LLM_API_URL || "https://openrouter.ai/api/v1/chat/completions";
    this.model = process.env.LLM_MODEL || "google/gemini-2.0-flash-001";
    this.temperature = parseFloat(process.env.LLM_TEMPERATURE || "0.3");
    this.maxTokens = parseInt(process.env.LLM_MAX_TOKENS || "4000", 10);

    if (!this.apiKey) {
      console.warn("Warning: LLM_API_KEY is not set. LLM functionality will not work properly.");
    }

    // Initialize OpenAI SDK for OpenRouter
    this.openai = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.apiUrl,
      defaultHeaders: {
        ...(process.env.LLM_HTTP_REFERER ? { "HTTP-Referer": process.env.LLM_HTTP_REFERER } : {}),
        ...(process.env.LLM_X_TITLE ? { "X-Title": process.env.LLM_X_TITLE } : {})
      }
    });
  }

  /**
   * Makes a request to the LLM API with the given system and user prompts
   * @param systemPrompt The system prompt to guide the LLM's behavior
   * @param userPrompt The user prompt containing the actual request
   * @returns The LLM's response text
   */
  private async makeLlmRequest(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error("LLM_API_KEY is not set");
      }

      // Use OpenAI SDK to call OpenRouter endpoint
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      const responseText = response.choices[0].message.content?.trim() || "";
      return responseText;
    } catch (error) {
      console.error("Error calling LLM API:", error);
      throw new Error(`Failed to process request: ${(error as Error).message}`);
    }
  }

  /**
   * Translates text to the specified target language using an LLM
   * @param text The text to translate
   * @param targetLanguage The language to translate to
   * @returns The translated text
   */
  async translate(text: string, targetLanguage: string): Promise<string> {
    const systemPrompt = "You are a professional translator. Translate the text accurately while preserving meaning and tone. IMPORTANT: Do not include any additional text other than the translation.  ";
    const userPrompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;

    return this.makeLlmRequest(systemPrompt, userPrompt);
  }

  /**
   * Corrects grammar in the provided text using an LLM
   * @param text The text to correct
   * @returns Object containing corrected text and optional explanations
   */
  async explainGrammar(text: string, targetLanguage: string): Promise<{ answer: string }> {
    const systemPrompt = "You are an expert in grammar and of the chinese language. IMPORTANT: Do not include any additional text other than the explanation.";
    const userPrompt =
      `Explain the grammar and syntax in the following text in ${targetLanguage}, 
    do not include any additional text other than the explanation,
    
    use markdown to format the response so it can be displayed nicely on a front end :\n\n${text}\n\n`;

    const response = await this.makeLlmRequest(systemPrompt, userPrompt);

    return { answer: response };
  }
}

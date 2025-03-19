import axios from "axios";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

export class LlmClient {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY || "";
    this.apiUrl = process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";
    this.model = process.env.LLM_MODEL || "gpt-3.5-turbo";
    this.temperature = parseFloat(process.env.LLM_TEMPERATURE || "0.3");
    this.maxTokens = parseInt(process.env.LLM_MAX_TOKENS || "4000", 10);

    if (!this.apiKey) {
      console.warn("Warning: LLM_API_KEY is not set. LLM functionality will not work properly.");
    }
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

      // Make a request to the LLM API
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          }
        }
      );

      // Extract the response text from the LLM
      const responseText = response.data.choices[0].message.content.trim();
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
    const systemPrompt = "You are a professional translator. Translate the text accurately while preserving meaning and tone.";
    const userPrompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;

    return this.makeLlmRequest(systemPrompt, userPrompt);
  }

  /**
   * Corrects grammar in the provided text using an LLM
   * @param text The text to correct
   * @returns Object containing corrected text and optional explanations
   */
  async explainGrammar(text: string): Promise<{ answer: string }> {
    const systemPrompt = "You are an expert in grammar and of the chinese language.";
    const userPrompt = `Explain the grammar and syntax in the following text :\n\n${text}\n\n`;

    const response = await this.makeLlmRequest(systemPrompt, userPrompt);

    return { answer: response };
  }

  /**
   * Summarizes the provided text using an LLM
   * @param text The text to summarize
   * @param maxLength Optional maximum length for the summary
   * @returns The summarized text
   */
  async summarize(text: string, maxLength?: number): Promise<string> {
    const systemPrompt = "You are an expert summarizer. Create concise summaries that capture the key points of the original text.";
    let userPrompt = `Summarize the following text:\n\n${text}`;

    if (maxLength) {
      userPrompt += `\n\nKeep the summary under ${maxLength} characters.`;
    }

    return this.makeLlmRequest(systemPrompt, userPrompt);
  }

  /**
   * Detects the language of the provided text using an LLM
   * @param text The text to analyze
   * @returns Object containing the detected language and confidence
   */
  async detectLanguage(text: string): Promise<{ detectedLanguage: string; confidence?: number }> {
    const systemPrompt = "You are a language detection expert. Identify the language of the provided text accurately.";
    const userPrompt = `Detect the language of the following text. Respond with the language code (e.g., 'en', 'es', 'fr') followed by the full language name in parentheses. If possible, include a confidence score between 0 and 1:\n\n${text}`;

    const response = await this.makeLlmRequest(systemPrompt, userPrompt);

    // Parse the response to extract language code and confidence
    const languageCodeMatch = response.match(/^([a-z]{2,3})\s*\(/i);
    const confidenceMatch = response.match(/confidence[:\s]*(0\.\d+|1\.0|1)/i);

    const detectedLanguage = languageCodeMatch ? languageCodeMatch[1].toLowerCase() : response.trim().split(/\s+/)[0].toLowerCase();
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : undefined;

    return { detectedLanguage, confidence };
  }

  /**
   * Analyzes the sentiment of the provided text using an LLM
   * @param text The text to analyze
   * @returns Object containing sentiment analysis results
   */
  async analyzeSentiment(text: string): Promise<{ sentiment: string; score?: number; details?: string }> {
    const systemPrompt = "You are a sentiment analysis expert. Analyze the sentiment of the provided text accurately.";
    const userPrompt = `Analyze the sentiment of the following text. Classify it as 'positive', 'negative', or 'neutral'. If possible, include a sentiment score between -1 (very negative) and 1 (very positive). Also provide a brief explanation of your analysis:\n\n${text}`;

    const response = await this.makeLlmRequest(systemPrompt, userPrompt);

    // Parse the response to extract sentiment, score, and details
    const sentimentMatch = response.match(/\b(positive|negative|neutral)\b/i);
    const scoreMatch = response.match(/score[:\s]*(-?0\.\d+|-?1\.0|-?1)/i);

    const sentiment = sentimentMatch ? sentimentMatch[1].toLowerCase() : "neutral";
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : undefined;

    // Remove the sentiment classification and score from the details
    let details = response;
    if (sentimentMatch) details = details.replace(new RegExp(`\b${sentimentMatch[1]}\b`, 'i'), '');
    if (scoreMatch) details = details.replace(scoreMatch[0], '');
    details = details.trim();

    return { sentiment, score, details };
  }
}

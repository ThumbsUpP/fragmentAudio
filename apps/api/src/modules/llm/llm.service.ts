import { LlmClient } from "./llm.client.js";
import { grammarPrompts, translationPrompts } from "./llm.prompts.js";

export interface GeneratedLlmText {
  text: string;
  provider: string;
  model: string;
}

export class LlmService {
  constructor(private readonly client = new LlmClient()) {}

  async translate(text: string, targetLanguage: string): Promise<GeneratedLlmText> {
    const prompts = translationPrompts(text, targetLanguage);
    const translatedText = await this.client.complete(prompts.system, prompts.user);

    return {
      text: translatedText,
      provider: this.client.provider,
      model: this.client.model,
    };
  }

  async explainGrammar(text: string, targetLanguage: string): Promise<GeneratedLlmText> {
    const prompts = grammarPrompts(text, targetLanguage);
    const answerMarkdown = await this.client.complete(prompts.system, prompts.user);

    return {
      text: answerMarkdown,
      provider: this.client.provider,
      model: this.client.model,
    };
  }
}

import { env } from "../../config/env.js";

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

const chatCompletionsUrl = (baseUrl: string): string => {
  const normalized = baseUrl.replace(/\/+$/, "");
  return normalized.endsWith("/chat/completions") ? normalized : `${normalized}/chat/completions`;
};

const providerFromUrl = (baseUrl: string): string => {
  try {
    const hostname = new URL(baseUrl).hostname;
    if (hostname.includes("openrouter")) {
      return "openrouter";
    }
  } catch {
    return "openai-compatible";
  }

  return "openai-compatible";
};

export class LlmClient {
  readonly provider = providerFromUrl(env.llmApiUrl);
  readonly model = env.llmModel;

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!env.llmApiKey) {
      throw new Error("LLM_API_KEY is not set");
    }

    const response = await fetch(chatCompletionsUrl(env.llmApiUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.llmApiKey}`,
        ...(env.llmHttpReferer ? { "HTTP-Referer": env.llmHttpReferer } : {}),
        ...(env.llmXTitle ? { "X-Title": env.llmXTitle } : {}),
      },
      body: JSON.stringify({
        model: env.llmModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: env.llmTemperature,
        max_tokens: env.llmMaxTokens,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`LLM request failed with ${response.status}: ${responseText}`);
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("LLM response did not include message content");
    }

    return content;
  }
}

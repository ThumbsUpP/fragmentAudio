import dotenv from "dotenv";

dotenv.config();

const numberFromEnv = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  apiPort: numberFromEnv(process.env.API_PORT, 4000),
  databaseUrl: process.env.DATABASE_URL || "postgresql://fragmentaudio:fragmentaudio@localhost:5432/fragmentaudio",
  stableTsUrl: process.env.STABLE_TS_URL || "http://localhost:5000/stable-ts",
  llmApiKey: process.env.LLM_API_KEY,
  llmApiUrl: process.env.LLM_API_URL || "https://openrouter.ai/api/v1",
  llmModel: process.env.LLM_MODEL || "google/gemini-2.0-flash-001",
  llmTemperature: numberFromEnv(process.env.LLM_TEMPERATURE, 0.3),
  llmMaxTokens: numberFromEnv(process.env.LLM_MAX_TOKENS, 4000),
  llmHttpReferer: process.env.LLM_HTTP_REFERER,
  llmXTitle: process.env.LLM_X_TITLE,
};

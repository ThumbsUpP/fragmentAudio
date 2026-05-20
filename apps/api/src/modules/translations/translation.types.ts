export type TranslationTargetType = "VIDEO" | "SEGMENT" | "WORD";

export interface TranslationDetail {
  id: string;
  targetType: TranslationTargetType;
  language: string;
  text: string;
  provider: string | null;
  model: string | null;
  videoId: string | null;
  segmentId: string | null;
  wordId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTranslationInput {
  language: string;
  text: string;
  provider: string | null;
  model: string | null;
}

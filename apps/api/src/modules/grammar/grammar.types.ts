export interface GrammarExplanationDetail {
  id: string;
  segmentId: string;
  language: string;
  answerMarkdown: string;
  provider: string | null;
  model: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGrammarExplanationInput {
  language: string;
  answerMarkdown: string;
  provider: string | null;
  model: string | null;
}

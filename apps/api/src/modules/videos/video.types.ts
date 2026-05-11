export interface VideoSummary {
  id: string;
  externalId: string;
  title: string;
  sourceUrl: string | null;
  sourceLanguage: string;
  createdAt: string;
  updatedAt: string;
  latestJobStatus: string | null;
  alignmentCount: number;
  segmentCount: number;
}

export interface VideoDetail extends VideoSummary {
  latestAlignmentId: string | null;
}

export interface CreateVideoInput {
  externalId: string;
  title: string;
  sourceUrl?: string;
  sourceLanguage?: string;
}

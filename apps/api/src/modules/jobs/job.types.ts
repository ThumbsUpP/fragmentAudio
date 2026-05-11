export interface JobSummary {
  id: string;
  videoId: string | null;
  videoTitle: string | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  step: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

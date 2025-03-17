import { AlignmentResult } from "./AlignmentResult.js";
import { TranslationResult } from "./TranslationResult.js";

/**
 * Represents the complete result of processing an audio file
 * through the orchestration service
 */
export interface ProcessingResult {
  /**
   * The ID of the video
   */
  videoId: string;
  
  /**
   * The URL of the video
   */
  videoUrl: string;
  
  /**
   * The result of the alignment process
   */
  alignmentResult?: AlignmentResult;
  
  /**
   * Optional result of the translation process
   * Only present if translation was requested
   */
  translationResult?: TranslationResult;
  
  /**
   * Timestamp when the processing was completed
   */
  completedAt: string;
  
  /**
   * Processing status
   */
  status: "success" | "partial_success" | "failed";
  
  /**
   * Optional error message if processing failed
   */
  error?: string;
}

import { StableTsClient } from "../clients/StableTsClient.js";
import { TranslationClient } from "../clients/TranslationClient.js";
import { VideoDbClient } from "../clients/VideoDbClient.js";
import { AudioProcessingRequest } from "../models/AudioProcessingRequest.js";
import { ProcessingResult } from "../models/ProcessingResult.js";
import { TranslationResult } from "../models/TranslationResult.js";
import { Logger } from "../utils/Logger.js";

/**
 * Service for orchestrating the processing of audio files
 * through various microservices
 */
export class OrchestrationService {
  private stableTsClient: StableTsClient;
  private translationClient: TranslationClient;
  private videoDbClient: VideoDbClient;
  private logger: Logger;

  constructor() {
    this.stableTsClient = new StableTsClient();
    this.translationClient = new TranslationClient();
    this.videoDbClient = new VideoDbClient();
    this.logger = new Logger("OrchestrationService");
  }

  /**
   * Process an audio file through the various microservices
   * @param request The audio processing request
   * @returns The processing result
   */
  async processAudio(request: AudioProcessingRequest): Promise<ProcessingResult> {
    this.logger.info(`Starting processing for video ID: ${request.videoId}`);
    
    try {
      // Step 1: Align audio with SRT using stable-ts
      this.logger.info("Step 1: Aligning audio with SRT");
      const alignmentResult = await this.stableTsClient.alignAudioWithSrt(
        request.videoId,
        request.videoUrl,
        request.audioFilePath,
        request.srtFilePath
      );
      
      // Initialize processing result
      const processingResult: ProcessingResult = {
        videoId: request.videoId,
        videoUrl: request.videoUrl,
        alignmentResult,
        completedAt: new Date().toISOString(),
        status: "success"
      };
      
      // Step 2: Translate if requested
      if (request.targetLanguage) {
        try {
          this.logger.info(`Step 2: Translating to ${request.targetLanguage}`);
          
          // Extract transcript text from alignment result
          const transcriptText = this.extractTranscriptText(alignmentResult);
          
          // Translate the transcript
          const translatedText = await this.translationClient.translateTranscript(
            transcriptText,
            request.targetLanguage
          );
          
          // Save the translation
          const translationResult = await this.videoDbClient.saveTranslation(
            request.videoId,
            request.targetLanguage,
            translatedText
          );
          
          // Add translation result to processing result
          processingResult.translationResult = translationResult;
        } catch (error) {
          this.logger.error(`Translation failed: ${(error as Error).message}`);
          processingResult.status = "partial_success";
          processingResult.error = `Alignment succeeded but translation failed: ${(error as Error).message}`;
        }
      }
      
      this.logger.info(`Processing completed for video ID: ${request.videoId}`);
      return processingResult;
    } catch (error) {
      this.logger.error(`Processing failed: ${(error as Error).message}`);
      
      // Return failure result
      return {
        videoId: request.videoId,
        videoUrl: request.videoUrl,
        alignmentResult: {
          alignment: null,
          videoId: request.videoId,
          videoUrl: request.videoUrl,
          savedToDb: false
        },
        completedAt: new Date().toISOString(),
        status: "failed",
        error: `Processing failed: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * Extract transcript text from alignment result
   * @param alignmentResult The alignment result
   * @returns The transcript text
   */
  private extractTranscriptText(alignmentResult: any): string {
    try {
      // Extract text from alignment result
      // This implementation depends on the structure of the alignment result
      // Adjust as needed based on the actual structure
      
      if (!alignmentResult.alignment || !Array.isArray(alignmentResult.alignment.segments)) {
        throw new Error("Invalid alignment result structure");
      }
      
      // Extract text from segments
      const segments = alignmentResult.alignment.segments;
      const transcriptText = segments
        .map((segment: any) => segment.text || "")
        .join(" ")
        .trim();
      
      return transcriptText;
    } catch (error) {
      this.logger.error(`Failed to extract transcript text: ${(error as Error).message}`);
      throw new Error(`Failed to extract transcript text: ${(error as Error).message}`);
    }
  }
  
  /**
   * Retry a failed processing request
   * @param request The audio processing request
   * @param maxRetries Maximum number of retry attempts
   * @param delayMs Delay between retries in milliseconds
   * @returns The processing result
   */
  async retryProcessing(
    request: AudioProcessingRequest,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<ProcessingResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(`Retry attempt ${attempt}/${maxRetries} for video ID: ${request.videoId}`);
        return await this.processAudio(request);
      } catch (error) {
        lastError = error as Error;
        this.logger.error(`Retry attempt ${attempt} failed: ${lastError.message}`);
        
        // Wait before next retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    // All retries failed
    this.logger.error(`All ${maxRetries} retry attempts failed for video ID: ${request.videoId}`);
    
    return {
      videoId: request.videoId,
      videoUrl: request.videoUrl,
      alignmentResult: {
        alignment: null,
        videoId: request.videoId,
        videoUrl: request.videoUrl,
        savedToDb: false
      },
      completedAt: new Date().toISOString(),
      status: "failed",
      error: `All ${maxRetries} retry attempts failed: ${lastError?.message}`
    };
  }
}

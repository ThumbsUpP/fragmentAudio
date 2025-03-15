/**
 * Represents a request to process an audio file and its corresponding SRT file
 */
export interface AudioProcessingRequest {
  /**
   * The ID of the video/audio
   */
  videoId: string;
  
  /**
   * The URL of the video/audio
   */
  videoUrl: string;
  
  /**
   * Path to the audio file
   */
  audioFilePath: string;
  
  /**
   * Path to the SRT file
   */
  srtFilePath: string;
  
  /**
   * Optional target language for translation
   */
  targetLanguage?: string;
}

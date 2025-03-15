/**
 * Represents the result of the alignment process from stable-ts
 */
export interface AlignmentResult {
  /**
   * The alignment data returned from stable-ts
   */
  alignment: any;
  
  /**
   * The ID of the video
   */
  videoId: string;
  
  /**
   * The URL of the video
   */
  videoUrl: string;
  
  /**
   * Whether the result was saved to the database
   */
  savedToDb: boolean;
  
  /**
   * Optional database record information
   */
  dbRecord?: any;
}

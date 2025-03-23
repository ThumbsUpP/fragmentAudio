/**
 * Represents the result of the alignment process from stable-ts
 */

type Language = 'zh' | 'en' | 'fr';
export type Translation = Partial<Record<Language, string>>;
// export type Translation = string;

export interface Word {
  word: string;
  start: number;
  end: number;
  pinyin?: string;
  translation?: Translation;
}

export interface Segment {
  text: string;
  start: number;
  end: number;
  id: number;
  words: Word[];
  translatedText?: Translation;
}

export interface AlignmentResult {
  /**
   * The alignment data returned from stable-ts
   */
  segments: Segment[];

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

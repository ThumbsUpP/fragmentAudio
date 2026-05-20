export interface StableTsWord {
  word: string;
  start: number;
  end: number;
  pinyin?: string;
}

export interface StableTsSegment {
  id?: number;
  text: string;
  start: number;
  end: number;
  words: StableTsWord[];
}

export interface StableTsAlignmentResult {
  segments: StableTsSegment[];
}

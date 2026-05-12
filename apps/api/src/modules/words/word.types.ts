export interface WordDetail {
  id: string;
  segmentId: string;
  index: number;
  text: string;
  pinyin: string | null;
  start: number;
  end: number;
}

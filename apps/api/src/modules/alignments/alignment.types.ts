export interface WordDto {
  id: string;
  index: number;
  text: string;
  pinyin: string | null;
  start: number;
  end: number;
}

export interface SegmentDto {
  id: string;
  externalSegmentId: string | null;
  index: number;
  text: string;
  start: number;
  end: number;
  words?: WordDto[];
}

export interface AlignmentDetail {
  id: string;
  videoId: string;
  provider: string;
  model: string | null;
  createdAt: string;
  updatedAt: string;
  segments: SegmentDto[];
}

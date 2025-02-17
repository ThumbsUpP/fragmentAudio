export type ParserOutput = {
  id: string;
  startTime: string;
  startSeconds: number;
  endTime: string;
  endSeconds: number;
  text: string;
}[];

export type Segments = {
  id: string;
  start: number; // in ms
  end: number; // in ms
  text: string;
}[]

export function srtParserMapper(libFormat: ParserOutput): Segments {
  return libFormat.map(item => ({
    id: item.id,
    start: item.startSeconds * 1000,
    end: item.endSeconds * 1000,
    text: item.text
  }));
}

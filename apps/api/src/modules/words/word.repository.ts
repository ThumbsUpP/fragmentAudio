import { pool } from "../../db/pool.js";
import type { WordDetail } from "./word.types.js";

interface WordRow {
  id: string;
  segment_id: string;
  index: number;
  text: string;
  pinyin: string | null;
  start: number;
  end: number;
}

const mapWord = (row: WordRow): WordDetail => ({
  id: row.id,
  segmentId: row.segment_id,
  index: row.index,
  text: row.text,
  pinyin: row.pinyin,
  start: row.start,
  end: row.end,
});

export class WordRepository {
  async listWordsForSegment(segmentId: string): Promise<WordDetail[]> {
    const result = await pool.query<WordRow>(
      `SELECT id, segment_id, index, text, pinyin, start, "end"
       FROM words
       WHERE segment_id = $1
       ORDER BY index ASC`,
      [segmentId]
    );

    return result.rows.map(mapWord);
  }

  async getWordById(wordId: string): Promise<WordDetail | null> {
    const result = await pool.query<WordRow>(
      `SELECT id, segment_id, index, text, pinyin, start, "end"
       FROM words
       WHERE id = $1`,
      [wordId]
    );

    const row = result.rows[0];
    return row ? mapWord(row) : null;
  }
}

import { Repository } from "typeorm";
import { AlignmentResult } from "../entity/AlignmentResult.js";
import { Segment } from "../entity/Segment.js";
import { Word } from "../entity/Word.js";
import { AppDataSource } from "../data-source.js";

export class AlignmentResultService {
  private repository: Repository<AlignmentResult>;
  private segmentRepository: Repository<Segment>;
  private wordRepository: Repository<Word>;

  constructor() {
    this.repository = AppDataSource.getRepository(AlignmentResult);
    this.segmentRepository = AppDataSource.getRepository(Segment);
    this.wordRepository = AppDataSource.getRepository(Word);
  }

  /**
   * Save alignment result to the database
   * @param videoId Unique identifier for the video
   * @param videoUrl URL of the video
   * @param alignmentData The alignment result data
   * @returns The saved alignment result entity
   */
  async saveAlignmentResult(
    videoId: string,
    videoUrl: string,
    alignmentData: any
  ): Promise<AlignmentResult> {
    // Check if alignment result already exists
    let alignmentResult = await this.repository.findOne({
      where: { videoId },
      relations: ["segments", "segments.words"],
    });

    if (alignmentResult) {
      // If alignment result exists, delete all related segments and words
      // This is a simpler approach than trying to update existing records
      for (const segment of alignmentResult.segments) {
        await this.wordRepository.delete({ segment: { id: segment.id } });
      }
      await this.segmentRepository.delete({ alignmentResult: { id: alignmentResult.id } });

      // Update basic properties
      alignmentResult.videoUrl = videoUrl;
      alignmentResult.savedToDb = true;
    } else {
      // Create new alignment result
      alignmentResult = new AlignmentResult();
      alignmentResult.videoId = videoId;
      alignmentResult.videoUrl = videoUrl;
      alignmentResult.savedToDb = true;

      // Save to get an ID
      alignmentResult = await this.repository.save(alignmentResult);
    }

    // Create segments and words
    const segments: Segment[] = [];

    if (Array.isArray(alignmentData.segments)) {
      for (const segmentData of alignmentData.segments) {
        const segment = new Segment();
        segment.text = segmentData.text;
        segment.start = segmentData.start;
        segment.end = segmentData.end;
        segment.alignmentResult = alignmentResult;
        segment.translatedText = segmentData.translatedText || null;
        segment.segmentId = segmentData.id;

        // Save segment to get ID
        const savedSegment = await this.segmentRepository.save(segment);

        // Create words
        if (Array.isArray(segmentData.words)) {
          const words: Word[] = [];
          for (const wordData of segmentData.words) {
            const word = new Word();
            word.word = wordData.word;
            word.start = wordData.start;
            word.end = wordData.end;
            word.pinyin = wordData.pinyin || null;
            word.translation = wordData.translation || null;
            word.segment = savedSegment;

            words.push(word);
          }

          // Save all words for this segment
          if (words.length > 0) {
            await this.wordRepository.save(words);
          }
        }

        segments.push(savedSegment);
      }
    }

    // Update the alignment result with segments
    alignmentResult.segments = segments;

    // Save and return the final result
    return this.repository.save(alignmentResult);
  }

  /**
   * Get alignment result by videoId
   * @param videoId The video ID to search for
   * @returns The alignment result entity or null if not found
   */
  async getAlignmentResultByVideoId(videoId: string): Promise<AlignmentResult | null> {
    return this.repository.findOne({
      where: { videoId },
      relations: ["segments", "segments.words"],
    });
  }

  /**
   * Get all alignment results
   * @returns Array of all alignment result entities
   */
  async getAllAlignmentResults(): Promise<AlignmentResult[]> {
    return this.repository.find({
      relations: ["segments", "segments.words"],
    });
  }

  /**
   * Delete alignment result by videoId
   * @param videoId The video ID to delete
   * @returns True if deleted, false if not found
   */
  async deleteAlignmentResult(videoId: string): Promise<boolean> {
    const alignmentResult = await this.repository.findOne({
      where: { videoId },
      relations: ["segments"],
    });

    if (!alignmentResult) {
      return false;
    }

    // Delete all related segments and words
    for (const segment of alignmentResult.segments) {
      await this.wordRepository.delete({ segment: { id: segment.id } });
    }
    await this.segmentRepository.delete({ alignmentResult: { id: alignmentResult.id } });

    // Delete the alignment result
    const result = await this.repository.delete({ videoId });
    return result.affected !== 0;
  }
}

import { Repository } from "typeorm";
import { VideoData } from "../entity/VideoData";
import { AppDataSource } from "../data-source";

export class VideoDataService {
    private repository: Repository<VideoData>;

    constructor() {
        this.repository = AppDataSource.getRepository(VideoData);
    }

    /**
     * Save video data to the database
     * @param videoId Unique identifier for the video
     * @param videoUrl URL of the video
     * @param jsonData JSON data to store (as object or string)
     * @returns The saved video data entity
     */
    async saveVideoData(videoId: string, videoUrl: string, jsonData: any): Promise<VideoData> {
        // Check if video already exists
        const existingVideo = await this.repository.findOne({ where: { videoId } });

        if (existingVideo) {
            // Update existing record
            existingVideo.videoUrl = videoUrl;
            existingVideo.jsonData = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
            return this.repository.save(existingVideo);
        } else {
            // Create new record
            const videoData = new VideoData();
            videoData.videoId = videoId;
            videoData.videoUrl = videoUrl;
            videoData.jsonData = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
            return this.repository.save(videoData);
        }
    }

    /**
     * Get video data by videoId
     * @param videoId The video ID to search for
     * @returns The video data entity or null if not found
     */
    async getVideoDataById(videoId: string): Promise<VideoData | null> {
        return this.repository.findOne({ where: { videoId } });
    }

    /**
     * Get all video data entries
     * @returns Array of all video data entities
     */
    async getAllVideoData(): Promise<VideoData[]> {
        return this.repository.find();
    }

    /**
     * Delete video data by videoId
     * @param videoId The video ID to delete
     * @returns True if deleted, false if not found
     */
    async deleteVideoData(videoId: string): Promise<boolean> {
        const result = await this.repository.delete({ videoId });
        return result.affected !== 0;
    }
}

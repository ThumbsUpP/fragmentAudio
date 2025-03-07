/**
 * Client utility for interacting with the Video Database Service
 */

// Define interface for error responses
interface ErrorResponse {
  error?: string;
  message?: string;
}

export interface Word {
  word: string;
  start: number;
  end: number;
}

export interface Subtitle {
  text: string;
  start: number;
  end: number;
  words: Word[];
}

export interface SubtitlesResponse {
  id: string;
  videoId: string;
  videoUrl: string;
  jsonData: Subtitle[];
}

export class VideoDbClient {
  private baseUrl: string;

  /**
   * Create a new VideoDbClient
   * @param baseUrl The base URL of the video database service
   */
  constructor(baseUrl: string = "http://localhost:3000/api/videos") {
    this.baseUrl = baseUrl;
  }

  /**
   * Save video data to the database
   * @param videoId Unique identifier for the video
   * @param videoUrl URL of the video
   * @param jsonData JSON data to store (array of subtitles)
   * @returns The saved video data
   */
  async saveVideoData(videoId: string, videoUrl: string, jsonData: Subtitle[]) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId,
        videoUrl,
        jsonData,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(`Failed to save video data: ${errorData.error || response.statusText}`);
    }

    return response.json() as unknown;
  }

  /**
   * Get video data by videoId
   * @param videoId The video ID to search for
   * @returns The video data or null if not found
   */
  async getVideoDataById(videoId: string): Promise<SubtitlesResponse | null> {
    const response = await fetch(`${this.baseUrl}/${videoId}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(`Failed to get video data: ${errorData.error || response.statusText}`);
    }

    return response.json() as Promise<SubtitlesResponse>;
  }

  /**
   * Get all video data entries
   * @returns Array of all video data
   */
  async getAllVideoData(): Promise<SubtitlesResponse[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(`Failed to get all video data: ${errorData.error || response.statusText}`);
    }

    return response.json() as Promise<SubtitlesResponse[]>;
  }

  /**
   * Delete video data by videoId
   * @param videoId The video ID to delete
   * @returns True if deleted, false if not found
   */
  async deleteVideoData(videoId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${videoId}`, {
      method: "DELETE",
    });

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(`Failed to delete video data: ${errorData.error || response.statusText}`);
    }

    return true;
  }
}

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { AlignmentResult } from "../models/AlignmentResult.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Client for interacting with the stable-ts alignment service
 */
export class StableTsClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.STABLE_TS_URL || "http://localhost:5001/stable-ts";
  }

  /**
   * Aligns an audio file with its corresponding SRT file
   * @param videoId The ID of the video
   * @param videoUrl The URL of the video
   * @param audioFilePath Path to the audio file
   * @param srtFilePath Path to the SRT file
   * @returns The alignment result
   */
  async alignAudioWithSrt(
    videoId: string,
    videoUrl: string,
    audioFilePath: string,
    srtFilePath: string
  ): Promise<AlignmentResult> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append("videoId", videoId);
      formData.append("videoUrl", videoUrl);
      formData.append("audio", fs.createReadStream(audioFilePath));
      formData.append("srt", fs.createReadStream(srtFilePath));

      // Send request to stable-ts service
      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (response.status !== 200) {
        throw new Error(`Stable-ts service returned status code ${response.status}`);
      }

      return response.data as AlignmentResult;
    } catch (error) {
      console.error("Error in StableTsClient.alignAudioWithSrt:", error);
      throw new Error(`Failed to align audio with SRT: ${(error as Error).message}`);
    }
  }
}

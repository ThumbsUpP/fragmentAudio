import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { env } from "../../config/env.js";
import { badRequest, serviceUnavailable } from "../../shared/http/errors.js";
import type { StableTsAlignmentResult } from "./video.import.types.js";

export class StableTsClient {
  async alignAudioWithSrt(videoId: string, audioPath: string, srtPath: string): Promise<StableTsAlignmentResult> {
    const formData = new FormData();
    formData.append("videoId", videoId);
    formData.append("audio", new Blob([await readFile(audioPath)]), basename(audioPath));
    formData.append("srt", new Blob([await readFile(srtPath)]), basename(srtPath));

    let response: Response;
    try {
      response = await fetch(env.stableTsUrl, { method: "POST", body: formData });
    } catch (error) {
      throw serviceUnavailable(`stable-ts is not reachable at ${env.stableTsUrl}: ${(error as Error).message}`);
    }

    if (!response.ok) {
      const responseText = await response.text();
      throw badRequest(`stable-ts returned ${response.status}: ${responseText}`);
    }

    return (await response.json()) as StableTsAlignmentResult;
  }
}

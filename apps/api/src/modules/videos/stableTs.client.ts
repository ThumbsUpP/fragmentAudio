import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { env } from "../../config/env.js";
import { badRequest } from "../../shared/http/errors.js";
import type { StableTsAlignmentResult } from "./video.import.types.js";

export class StableTsClient {
  async alignAudioWithSrt(videoId: string, audioPath: string, srtPath: string): Promise<StableTsAlignmentResult> {
    const formData = new FormData();
    formData.append("videoId", videoId);
    formData.append("audio", new Blob([await readFile(audioPath)]), basename(audioPath));
    formData.append("srt", new Blob([await readFile(srtPath)]), basename(srtPath));

    const response = await fetch(env.stableTsUrl, { method: "POST", body: formData });
    if (!response.ok) {
      throw badRequest(`stable-ts returned ${response.status}`);
    }

    return (await response.json()) as StableTsAlignmentResult;
  }
}

import { Router, Request, Response } from "express";
import { VideoDbClient } from "../clients/VideoDbClient.js";
import { LlmClient } from "../clients/LlmClient.js";
import { Logger } from "../utils/Logger.js";
import axios from "axios";

const router: Router = Router();
const videoDbClient = new VideoDbClient();
const llmClient = new LlmClient();
const logger = new Logger("GrammarRoutes");

/**
 * Route to get grammar explanation for a segment
 * This route will:
 * 1. Check if a grammar record exists in the video-db
 * 2. If it exists, return that record
 * 3. If not, call the LLM service to generate it, save it to video-db, and return it
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { videoId, segmentId, text, targetLanguage } = req.body;

    if (!videoId || !segmentId || !text) {
      return res.status(400).json({ 
        error: "videoId, segmentId, and text are required" 
      });
    }

    logger.info(`Processing grammar explanation request for videoId: ${videoId}, segmentId: ${segmentId}`);
    
    // First, try to get existing grammar record from video-db
    try {
      const existingRecord = await videoDbClient.getGrammarExplanation(videoId, segmentId);
      
      if (existingRecord) {
        logger.info(`Found existing grammar explanation for videoId: ${videoId}, segmentId: ${segmentId}`);
        return res.status(200).json(existingRecord);
      }
    } catch (error) {
      // If error is not 404 (not found), log it but continue to generate new explanation
      if (axios.isAxiosError(error) && error.response && error.response.status !== 404) {
        logger.warn(`Error checking for existing grammar record: ${(error as Error).message}`);
      }
    }

    // If no existing record found, generate new explanation using LLM service
    logger.info(`Generating new grammar explanation for videoId: ${videoId}, segmentId: ${segmentId}`);
    const result = await llmClient.explainGrammar(
      videoId,
      segmentId,
      text,
      targetLanguage || "english"
    );

    // Save the new explanation to video-db
    try {
      await videoDbClient.saveGrammarExplanation(result);
      logger.info(`Saved grammar explanation to video-db for videoId: ${videoId}, segmentId: ${segmentId}`);
    } catch (saveError) {
      logger.warn(`Failed to save grammar explanation to video-db: ${(saveError as Error).message}`);
      // Continue even if save fails
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error explaining grammar: ${(error as Error).message}`);
    return res.status(500).json({ error: `Failed to explain grammar: ${(error as Error).message}` });
  }
});

export default router;

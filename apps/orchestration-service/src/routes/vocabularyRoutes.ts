import { Router, Request, Response, text } from "express";
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
// POST /: Get or create vocabulary for a video
router.post("/", async (req: Request, res: Response) => {
    try {
        const { videoId, items, text, targetLanguage } = req.body;

        if (!videoId) {
            return res.status(400).json({
                error: "videoId is required"
            });
        }

        logger.info(`Processing vocabulary request for videoId: ${videoId}`);

        // First, try to get existing vocabulary record from video-db
        try {
            const existingRecord = await videoDbClient.getVocabulary(videoId);

            if (existingRecord) {
                logger.info(`Found existing vocabulary for videoId: ${videoId}`);
                return res.status(200).json(existingRecord);
            }
        } catch (error) {
            // If error is not 404 (not found), log it but continue to generate new explanation
            if (axios.isAxiosError(error) && error.response && error.response.status !== 404) {
                logger.warn(`Error checking for existing vocabulary: ${(error as Error).message}`);
            }
        }

        // If no existing record found, optionally generate new one using LLM (if items not provided)
        let newItems = items;
        if (!items) {
            // Generate vocabulary via LLM
            logger.info(`Generating new vocabulary for videoId: ${videoId}`);
            // You may want to adjust the LLM call as needed
            const result = await llmClient.explainVocabulary?.(videoId, text, targetLanguage || "english");
            if (!result || !result.items) {
                return res.status(500).json({ error: "Failed to generate vocabulary via LLM" });
            }
            newItems = result.items;
        }

        // Save the new vocabulary list to video-db
        try {
            const created = await videoDbClient.createVocabulary(videoId, newItems);
            logger.info(`Saved vocabulary to video-db for videoId: ${videoId}`);
            return res.status(201).json(created);
        } catch (saveError) {
            logger.warn(`Failed to save vocabulary to video-db: ${(saveError as Error).message}`);
            return res.status(500).json({ error: `Failed to save vocabulary: ${(saveError as Error).message}` });
        }
    } catch (error) {
        logger.error(`Error handling vocabulary request: ${(error as Error).message}`);
        return res.status(500).json({ error: `Failed to handle vocabulary request: ${(error as Error).message}` });
    }
});

// GET /:videoId: Get vocabulary list for a video
router.get("/:videoId", async (req: Request, res: Response) => {
    const { videoId } = req.params;
    if (!videoId) {
        return res.status(400).json({ error: "videoId is required" });
    }
    try {
        const vocab = await videoDbClient.getVocabulary(videoId);
        if (!vocab) {
            return res.status(404).json({ error: "Vocabulary not found for this video" });
        }
        return res.status(200).json(vocab);
    } catch (error) {
        logger.error(`Error fetching vocabulary for videoId ${videoId}: ${(error as Error).message}`);
        return res.status(500).json({ error: `Failed to fetch vocabulary: ${(error as Error).message}` });
    }
});

// PATCH /:videoId: Update vocabulary list for a video
router.patch("/:videoId", async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const { items } = req.body;
    if (!videoId || !Array.isArray(items)) {
        return res.status(400).json({ error: "videoId and items array are required" });
    }
    try {
        const updated = await videoDbClient.updateVocabulary(videoId, items);
        return res.status(200).json(updated);
    } catch (error) {
        logger.error(`Error updating vocabulary for videoId ${videoId}: ${(error as Error).message}`);
        return res.status(500).json({ error: `Failed to update vocabulary: ${(error as Error).message}` });
    }
});


export default router;

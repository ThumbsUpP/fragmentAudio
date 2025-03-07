import { Router, Request, Response } from "express";
import { TranslationDataService } from "../service/TranslationDataService.js";
import { VideoDataService } from "../service/VideoDataService.js";

const router = Router();
const translationDataService = new TranslationDataService();
const videoDataService = new VideoDataService();

// Get all translations for a video
router.get("/:videoId/translations", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const language = req.query.language as string | undefined;

    // Check if video exists
    const videoExists = await videoDataService.getVideoDataById(videoId);
    if (!videoExists) {
      return res.status(404).json({ error: "Video not found" });
    }

    const translations = await translationDataService.getTranslationsForVideo(videoId, language);
    return res.status(200).json(translations);
  } catch (error) {
    console.error(`Error fetching translations for video ID ${req.params.videoId}:`, error);
    return res.status(500).json({ error: "Failed to fetch translations" });
  }
});

// Create or update a translation
router.post("/:videoId/translations", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { language, translatedText } = req.body;

    if (!language || !translatedText) {
      return res.status(400).json({ error: "language and translatedText are required" });
    }

    // Check if video exists
    const videoExists = await videoDataService.getVideoDataById(videoId);
    if (!videoExists) {
      return res.status(404).json({ error: "Video not found" });
    }

    const savedTranslation = await translationDataService.saveTranslation(
      videoId,
      language,
      translatedText
    );

    return res.status(201).json(savedTranslation);
  } catch (error) {
    console.error(`Error saving translation for video ID ${req.params.videoId}:`, error);
    return res.status(500).json({ error: "Failed to save translation" });
  }
});

// Delete a translation
router.delete("/:videoId/translations", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const language = req.query.language as string;

    if (!language) {
      return res.status(400).json({ error: "language query parameter is required" });
    }

    const deleted = await translationDataService.deleteTranslation(videoId, language);

    if (!deleted) {
      return res.status(404).json({ error: "Translation not found" });
    }

    return res.status(200).json({ message: "Translation deleted successfully" });
  } catch (error) {
    console.error(`Error deleting translation for video ID ${req.params.videoId}:`, error);
    return res.status(500).json({ error: "Failed to delete translation" });
  }
});

export default router;

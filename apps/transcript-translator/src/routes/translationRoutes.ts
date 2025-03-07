import { Router, Request, Response, IRouter } from "express";
import { TranslationService } from "../service/TranslationService.js";

const router: IRouter = Router();
const translationService = new TranslationService();

// Translate a transcript
router.post("/", async (req: Request, res: Response) => {
  try {
    const { videoId, transcript, targetLanguage } = req.body;

    if (!videoId || !transcript || !targetLanguage) {
      return res.status(400).json({ 
        error: "videoId, transcript, and targetLanguage are required" 
      });
    }

    const translatedText = await translationService.translateTranscript(
      transcript, 
      targetLanguage
    );

    // Save translation result to video-db if needed
    const saveResult = await translationService.saveTranslation(
      videoId, 
      targetLanguage, 
      translatedText
    );

    return res.status(200).json({
      videoId,
      targetLanguage,
      originalTranscript: transcript,
      translatedTranscript: translatedText,
      savedToDb: saveResult !== null
    });
  } catch (error) {
    console.error("Error translating transcript:", error);
    return res.status(500).json({ error: "Failed to translate transcript" });
  }
});

// Get translations for a video
router.get("/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const language = req.query.language as string | undefined;
    
    const translations = await translationService.getTranslationsForVideo(videoId, language);
    
    if (!translations || translations.length === 0) {
      return res.status(404).json({ error: "No translations found for this video" });
    }
    
    return res.status(200).json(translations);
  } catch (error) {
    console.error(`Error fetching translations for video ID ${req.params.videoId}:`, error);
    return res.status(500).json({ error: "Failed to fetch translations" });
  }
});

// Delete a translation
router.delete("/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const language = req.query.language as string | undefined;
    
    if (!language) {
      return res.status(400).json({ error: "Language parameter is required" });
    }
    
    const deleted = await translationService.deleteTranslation(videoId, language);
    
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

import { Router, Request, Response, IRouter } from "express";
import { LlmService } from "../service/LlmService.js";
import { ProcessingType } from "../models/LlmProcessingModel.js";

const router: IRouter = Router();
const llmService = new LlmService();

// Translate text
router.post("/", async (req: Request, res: Response) => {
  console.log("Translating text...", req.body); 
  try {
    const { videoId, text, targetLanguage } = req.body;

    if (!videoId || !text || !targetLanguage) {
      return res.status(400).json({ 
        error: "videoId, text, and targetLanguage are required" 
      });
    }

    const result = await llmService.translateText(
      videoId,
      text, 
      targetLanguage
    );

    return res.status(200).json({
      videoId,
      targetLanguage,
      originalText: text,
      translatedText: result.translatedText,
      processingType: result.processingType,
      createdAt: result.createdAt
    });
  } catch (error) {
    console.error("Error translating text:", error);
    return res.status(500).json({ error: "Failed to translate text" });
  }
});

export default router;
 
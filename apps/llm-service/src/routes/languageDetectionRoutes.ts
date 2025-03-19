import { Router, Request, Response, IRouter } from "express";
import { LlmService } from "../service/LlmService.js";

const router: IRouter = Router();
const llmService = new LlmService();

// Detect language of text
router.post("/", async (req: Request, res: Response) => {
  try {
    const { videoId, text } = req.body;

    if (!videoId || !text) {
      return res.status(400).json({ 
        error: "videoId and text are required" 
      });
    }

    const result = await llmService.detectLanguage(
      videoId,
      text
    );

    return res.status(200).json({
      videoId,
      originalText: text,
      detectedLanguage: result.detectedLanguage,
      confidence: result.confidence,
      processingType: result.processingType,
      createdAt: result.createdAt
    });
  } catch (error) {
    console.error("Error detecting language:", error);
    return res.status(500).json({ error: "Failed to detect language" });
  }
});

export default router;

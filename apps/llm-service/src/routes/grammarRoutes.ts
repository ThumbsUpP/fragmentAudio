import { Router, Request, Response, IRouter } from "express";
import { LlmService } from "../service/LlmService.js";

const router: IRouter = Router();
const llmService = new LlmService();

// Explain grammar in text
router.post("/", async (req: Request, res: Response) => {
  try {
    const { videoId, segmentId, text, targetLanguage } = req.body;

    if (!videoId || !segmentId || !text) {
      return res.status(400).json({ 
        error: "videoId, segmentId, and text are required" 
      });
    }
    
    const result = await llmService.explainGrammar(
      segmentId,
      videoId,
      text,
      targetLanguage ||"english"
    );

    return res.status(200).json({
      videoId,
      segmentId: result.id,
      originalText: text,
      answer: result.answer,
      processingType: result.processingType,
      createdAt: result.createdAt
    });
  } catch (error) {
    console.error("Error explaining grammar:", error);
    return res.status(500).json({ error: "Failed to explain grammar" });
  }
});

export default router;

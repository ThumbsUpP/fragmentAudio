import { Router, Request, Response, IRouter } from "express";
import { LlmService } from "../service/LlmService.js";

const router: IRouter = Router();
const llmService = new LlmService();

// Analyze sentiment of text
router.post("/", async (req: Request, res: Response) => {
  try {
    const { videoId, text } = req.body;

    if (!videoId || !text) {
      return res.status(400).json({ 
        error: "videoId and text are required" 
      });
    }

    const result = await llmService.analyzeSentiment(
      videoId,
      text
    );

    return res.status(200).json({
      videoId,
      originalText: text,
      sentiment: result.sentiment,
      score: result.score,
      details: result.details,
      processingType: result.processingType,
      createdAt: result.createdAt
    });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return res.status(500).json({ error: "Failed to analyze sentiment" });
  }
});

export default router;

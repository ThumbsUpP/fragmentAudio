import { Router, Request, Response, IRouter } from "express";
import { LlmService } from "../service/LlmService.js";

const router: IRouter = Router();
const llmService = new LlmService();

// Summarize text
router.post("/", async (req: Request, res: Response) => {
  try {
    const { videoId, text, maxLength } = req.body;

    if (!videoId || !text) {
      return res.status(400).json({ 
        error: "videoId and text are required" 
      });
    }

    const result = await llmService.summarizeText(
      videoId,
      text,
      maxLength
    );

    return res.status(200).json({
      videoId,
      originalText: text,
      summary: result.summary,
      maxLength: result.maxLength,
      processingType: result.processingType,
      createdAt: result.createdAt
    });
  } catch (error) {
    console.error("Error summarizing text:", error);
    return res.status(500).json({ error: "Failed to summarize text" });
  }
});

export default router;

import { Router, Request, Response, IRouter } from "express";
import { GrammarExplanationService } from "../service/GrammarExplanationService.js";
import { instanceToPlain } from "class-transformer";
import { GrammarExplanation } from "../entity/GrammarExplanation.js";

const router: IRouter = Router();
const grammarExplanationService = new GrammarExplanationService();

// Get grammar explanation by video ID and segment ID
router.get("/:videoId/:segmentId", async (req: Request, res: Response) => {
  try {
    const { videoId, segmentId } = req.params;
    const result = await grammarExplanationService.getGrammarExplanation(videoId, segmentId);

    if (!result) {
      return res.status(404).json({ error: "Grammar explanation not found" });
    }

    return res.status(200).json(instanceToPlain(result));
  } catch (error) {
    console.error(`Error fetching grammar explanation for videoId ${req.params.videoId}, segmentId ${req.params.segmentId}:`, error);
    return res.status(500).json({ error: "Failed to fetch grammar explanation" });
  }
});

// Create or update grammar explanation
router.post("/", async (req: Request, res: Response) => {
  try {
    const { videoId, segmentId, originalText, answer, processingType, createdAt } = req.body;

    if (!videoId || !segmentId || !originalText || !answer || !processingType) {
      return res.status(400).json({
        error: "videoId, segmentId, originalText, answer, and processingType are required"
      });
    }

    // Create grammar explanation object
    const grammarExplanation = new GrammarExplanation();
    grammarExplanation.videoId = videoId;
    grammarExplanation.segmentId = segmentId;
    grammarExplanation.originalText = originalText;
    grammarExplanation.answer = answer;
    grammarExplanation.processingType = processingType;
    
    if (createdAt) {
      grammarExplanation.createdAt = new Date(createdAt);
    }

    const savedResult = await grammarExplanationService.saveGrammarExplanation(grammarExplanation);

    return res.status(201).json(instanceToPlain(savedResult));
  } catch (error) {
    console.error("Error saving grammar explanation:", error);
    return res.status(500).json({
      error: `Failed to save grammar explanation: ${(error as Error).message}`
    });
  }
});

export default router;

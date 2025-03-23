import { Router, Request, Response, IRouter } from "express";
import { AlignmentResultService } from "../service/AlignmentResultService.js";
import { instanceToPlain } from "class-transformer";

const router: IRouter = Router();
const alignmentResultService = new AlignmentResultService();

// Get all alignment results
router.get("/", async (_req: Request, res: Response) => {
  try {
    const allResults = await alignmentResultService.getAllAlignmentResults();
    return res.status(200).json(instanceToPlain(allResults));
  } catch (error) {
    console.error("Error fetching all alignment results:", error);
    return res.status(500).json({ error: "Failed to fetch alignment results" });
  }
});

// Get alignment result by video ID
router.get("/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const result = await alignmentResultService.getAlignmentResultByVideoId(videoId);

    if (!result) {
      return res.status(404).json({ error: "Alignment result not found" });
    }

    return res.status(200).json(instanceToPlain(result));
  } catch (error) {
    console.error(`Error fetching alignment result for video ID ${req.params.videoId}:`, error);
    return res.status(500).json({ error: "Failed to fetch alignment result" });
  }
});

// Create or update alignment result
router.post("/", async (req: Request, res: Response) => {
  try {
    const { videoId, videoUrl, alignmentData } = req.body;

    if (!videoId || !videoUrl || !alignmentData) {
      return res.status(400).json({
        error: "videoId, videoUrl, and alignmentData are required"
      });
    }

    const savedResult = await alignmentResultService.saveAlignmentResult(
      videoId,
      videoUrl,
      alignmentData
    );

    return res.status(201).json(instanceToPlain(savedResult));
  } catch (error) {
    console.error("Error saving alignment result:", error);
    return res.status(500).json({
      error: `Failed to save alignment result: ${(error as Error).message}`
    });
  }
});

// Delete alignment result
router.delete("/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const deleted = await alignmentResultService.deleteAlignmentResult(videoId);

    if (!deleted) {
      return res.status(404).json({ error: "Alignment result not found" });
    }

    return res.status(200).json(instanceToPlain({ message: "Alignment result deleted successfully" }));
  } catch (error) {
    console.error(`Error deleting alignment result for video ID ${req.params.videoId}:`, error);
    return res.status(500).json({ error: "Failed to delete alignment result" });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { VideoDataService } from "../service/VideoDataService";

const router = Router();
const videoDataService = new VideoDataService();

// Get all video data
router.get("/", async (_req: Request, res: Response) => {
  try {
    const allVideoData = await videoDataService.getAllVideoData();
    return res.status(200).json(allVideoData);
  } catch (error) {
    console.error("Error fetching all video data:", error);
    return res.status(500).json({ error: "Failed to fetch video data" });
  }
});

// Get video data by ID
router.get("/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const videoData = await videoDataService.getVideoDataById(videoId);

    if (!videoData) {
      return res.status(404).json({ error: "Video data not found" });
    }

    return res.status(200).json({
      id: videoData.id,
      videoId: videoData.videoId,
      videoUrl: videoData.videoUrl,
      jsonData: videoData.getJsonData(),
      createdAt: videoData.createdAt,
      updatedAt: videoData.updatedAt,
    });
  } catch (error) {
    console.error(`Error fetching video data for ID ${req.params.videoId}:`, error);
    return res.status(500).json({ error: "Failed to fetch video data" });
  }
});

// Create or update video data
router.post("/", async (req: Request, res: Response) => {
  try {
    const { videoId, videoUrl, jsonData } = req.body;

    if (!videoId || !videoUrl || !jsonData) {
      return res.status(400).json({ error: "videoId, videoUrl, and jsonData are required" });
    }

    const savedVideoData = await videoDataService.saveVideoData(videoId, videoUrl, jsonData);

    return res.status(201).json({
      id: savedVideoData.id,
      videoId: savedVideoData.videoId,
      videoUrl: savedVideoData.videoUrl,
      jsonData: savedVideoData.getJsonData(),
      createdAt: savedVideoData.createdAt,
      updatedAt: savedVideoData.updatedAt,
    });
  } catch (error) {
    console.error("Error saving video data:", error);
    return res.status(500).json({ error: "Failed to save video data" });
  }
});

// Delete video data
router.delete("/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const deleted = await videoDataService.deleteVideoData(videoId);

    if (!deleted) {
      return res.status(404).json({ error: "Video data not found" });
    }

    return res.status(200).json({ message: "Video data deleted successfully" });
  } catch (error) {
    console.error(`Error deleting video data for ID ${req.params.videoId}:`, error);
    return res.status(500).json({ error: "Failed to delete video data" });
  }
});

export default router;

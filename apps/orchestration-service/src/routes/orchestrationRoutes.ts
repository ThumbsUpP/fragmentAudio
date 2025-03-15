import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { OrchestrationService } from "../service/OrchestrationService.js";
import { AudioProcessingRequest } from "../models/AudioProcessingRequest.js";
import { Logger } from "../utils/Logger.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
const router: Router = Router();
const orchestrationService = new OrchestrationService();
const logger = new Logger("OrchestrationRoutes");

// Process audio route
router.post(
  "/process",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "srt", maxCount: 1 }
  ]),
  async (req: Request, res: Response) => {
    try {
      logger.info("Received process request");
      
      // Check for required files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (!files.audio || !files.srt) {
        return res.status(400).json({ error: "Audio file and SRT file are required" });
      }
      
      // Check for required fields
      const { videoId, videoUrl } = req.body;
      if (!videoId || !videoUrl) {
        return res.status(400).json({ error: "videoId and videoUrl are required" });
      }
      
      // Get file paths
      const audioFilePath = files.audio[0].path;
      const srtFilePath = files.srt[0].path;
      
      // Create processing request
      const request: AudioProcessingRequest = {
        videoId,
        videoUrl,
        audioFilePath,
        srtFilePath,
        targetLanguage: req.body.targetLanguage
      };
      
      // Process the request
      const result = await orchestrationService.processAudio(request);
      
      // Clean up temporary files
      try {
        fs.unlinkSync(audioFilePath);
        fs.unlinkSync(srtFilePath);
      } catch (error) {
        logger.warn(`Failed to clean up temporary files: ${(error as Error).message}`);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error(`Error processing request: ${(error as Error).message}`);
      return res.status(500).json({ error: `Failed to process request: ${(error as Error).message}` });
    }
  }
);

// Retry processing route
router.post("/retry/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { videoUrl, audioFilePath, srtFilePath, targetLanguage, maxRetries } = req.body;
    
    if (!videoUrl || !audioFilePath || !srtFilePath) {
      return res.status(400).json({ 
        error: "videoUrl, audioFilePath, and srtFilePath are required" 
      });
    }
    
    // Check if files exist
    if (!fs.existsSync(audioFilePath) || !fs.existsSync(srtFilePath)) {
      return res.status(400).json({ error: "Audio file or SRT file not found" });
    }
    
    // Create processing request
    const request: AudioProcessingRequest = {
      videoId,
      videoUrl,
      audioFilePath,
      srtFilePath,
      targetLanguage
    };
    
    // Retry processing
    const result = await orchestrationService.retryProcessing(
      request,
      maxRetries || 3
    );
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Error retrying processing: ${(error as Error).message}`);
    return res.status(500).json({ 
      error: `Failed to retry processing: ${(error as Error).message}` 
    });
  }
});

// Health check route
router.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({ 
    status: "ok", 
    service: "orchestration-service",
    timestamp: new Date().toISOString() 
  });
});

export default router;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import orchestrationRoutes from "./routes/orchestrationRoutes.js";
import { Logger } from "./utils/Logger.js";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 4000;
const logger = new Logger("OrchestrationService");

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ 
    status: "ok", 
    service: "orchestration-service",
    timestamp: new Date().toISOString() 
  });
});

// API routes
app.use("/api/orchestration", orchestrationRoutes);

// Start the server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Orchestration API available at http://localhost:${PORT}/api/orchestration`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${(error as Error).message}`);
    process.exit(1);
  }
};

startServer();

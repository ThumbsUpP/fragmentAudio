import dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables at the very beginning
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from "express";
import cors from "cors";
import { initializeDatabase } from "./data-source.js";
import videoRoutes from "./routes/videoRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";
import * as fs from "fs";

// Ensure data directory exists for SQLite
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/videos", videoRoutes);
// Use the video routes for translations as well since they're nested under videos
app.use("/api/videos", translationRoutes);

// Start the server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Video database API available at http://localhost:${PORT}/api/videos`);
      console.log(`Translation API available at http://localhost:${PORT}/api/videos/:videoId/translations`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

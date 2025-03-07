import express from "express";
import cors from "cors";
import translationRoutes from "./routes/translationRoutes.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/translations", translationRoutes);

// Start the server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Translation service running on port ${PORT}`);
      console.log(`Translation API available at http://localhost:${PORT}/api/translations`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

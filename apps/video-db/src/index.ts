import express from "express";
import cors from "cors";
import { initializeDatabase } from "./data-source";
import videoRoutes from "./routes/videoRoutes";
import * as fs from "fs";
import * as path from "path";

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

// Start the server
const startServer = async () => {
    try {
        // Initialize database connection
        await initializeDatabase();
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Video database API available at http://localhost:${PORT}/api/videos`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

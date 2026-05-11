import cors from "cors";
import express, { type Application } from "express";
import { healthRouter } from "./modules/health/health.routes.js";
import { videoRouter } from "./modules/videos/video.routes.js";

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  app.use(healthRouter);
  app.use("/api/videos", videoRouter);

  return app;
};

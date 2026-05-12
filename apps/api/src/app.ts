import cors from "cors";
import express, { type Application } from "express";
import { healthRouter } from "./modules/health/health.routes.js";
import { jobRouter } from "./modules/jobs/job.routes.js";
import { segmentRouter } from "./modules/segments/segment.routes.js";
import { videoRouter } from "./modules/videos/video.routes.js";
import { wordRouter } from "./modules/words/word.routes.js";
import { errorHandler } from "./shared/http/errors.js";

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  app.use(healthRouter);
  app.use("/api/videos", videoRouter);
  app.use("/api/jobs", jobRouter);
  app.use("/api/segments", segmentRouter);
  app.use("/api/words", wordRouter);

  app.use(errorHandler);

  return app;
};

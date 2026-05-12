import { Router, type IRouter } from "express";

export const healthRouter: IRouter = Router();

healthRouter.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "fragment-audio-api",
    timestamp: new Date().toISOString(),
  });
});

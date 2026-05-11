import { Router, type IRouter } from "express";

export const videoRouter: IRouter = Router();

videoRouter.get("/", (_req, res) => {
  return res.status(501).json({
    error: "Videos API is part of the v2 migration and is not implemented yet.",
  });
});

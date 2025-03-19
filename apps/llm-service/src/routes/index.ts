import { Router, IRouter } from "express";
import translationRoutes from "./translationRoutes.js";
import grammarRoutes from "./grammarRoutes.js";
import summarizationRoutes from "./summarizationRoutes.js";
import languageDetectionRoutes from "./languageDetectionRoutes.js";
import sentimentRoutes from "./sentimentRoutes.js";

const router: IRouter = Router();

// Mount all routes
router.use("/translate", translationRoutes);
router.use("/grammar", grammarRoutes);
router.use("/summarize", summarizationRoutes);
router.use("/detect", languageDetectionRoutes);
router.use("/sentiment", sentimentRoutes);


export default router;

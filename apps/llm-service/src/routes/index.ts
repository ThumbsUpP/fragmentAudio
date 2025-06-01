import { Router, IRouter } from "express";
import translationRoutes from "./translationRoutes.js";
import grammarRoutes from "./grammarRoutes.js";


const router: IRouter = Router();

// Mount all routes
router.use("/translate", translationRoutes);
router.use("/grammar", grammarRoutes);



export default router;

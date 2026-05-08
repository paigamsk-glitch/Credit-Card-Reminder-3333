import { Router, type IRouter } from "express";

import authRouter from "./auth";
import cardsRouter from "./cards";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(cardsRouter);

export default router;

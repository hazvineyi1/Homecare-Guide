import { Router, type IRouter } from "express";
import healthRouter from "./health";
import anthropicRouter from "./anthropic/index";
import tutorRouter from "./tutor/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(anthropicRouter);
router.use(tutorRouter);

export default router;

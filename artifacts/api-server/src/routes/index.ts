import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tutorRouter from "./tutor/index";
import authRouter from "./auth";
import certificateRouter from "./certificate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tutorRouter);
router.use(authRouter);
router.use(certificateRouter);

export default router;

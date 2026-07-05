import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tutorRouter from "./tutor/index";
import authRouter from "./auth";
import certificateRouter from "./certificate";
import orgRouter from "./org";
import billingRouter from "./billing";
import resetRouter from "./reset";
import whatsappRouter from "./whatsapp";
import leadsRouter from "./leads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tutorRouter);
router.use(authRouter);
router.use(certificateRouter);
router.use(orgRouter);
router.use(billingRouter);
router.use(resetRouter);
router.use(whatsappRouter);
router.use(leadsRouter);

export default router;
